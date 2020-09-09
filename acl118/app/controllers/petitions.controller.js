const Petitions = require('../models/petitions.model');
const Users = require('../models/users.model');

exports.getPetitions = async function (req, res) {

    let startIndex = req.query.startIndex;
    const count = req.query.count;
    const q = req.query.q;
    const categoryId = req.query.categoryId;
    const authorId = req.query.authorId;
    const sortBy = req.query.sortBy;
    let data = {}

    if (startIndex !== undefined) {
        if (parseInt(startIndex) >= 0) {
            data["startIndex"] = parseInt(startIndex);
        } else {
            res.status(400).send("startIndex must be an integer");
        }
    } else {
        data["startIndex"] = 0;
    }

    if (count !== undefined) {
        if (parseInt(count) >= 0) {
            data["count"] = parseInt(count);
        } else {
            res.status(400).send("count must be an integer");
        }
    } else {
        data["count"] = 100000000000000;
    }

    if (authorId !== undefined) {
        parseInt(authorId) ? data["authorId"] = parseInt(authorId) : res.status(400).send("authorId must be an integer");
    }

    if (q !== undefined) { //There is some sort of user input for q
        if (q.length > 0) {
            //Must check that string actually has a character and not only white space characters (according to reference server)
            if (!q.replace(/\s/g, "").length) {
                res.status(400).send("q must not be shorter than 1 character");
            } else {
                data["q"] = q;
            }
        } else {
            res.status(400).send("q must not be shorter than 1 character");
        }
    }

    if (sortBy !== undefined) {
        const allowedValues = ["SIGNATURES_DESC", "SIGNATURES_ASC", "ALPHABETICAl_DESC", "ALPHABETICAL_ASC"];
        allowedValues.includes(sortBy) ? data["sortBy"] = sortBy : res.status(400).send("sortBy should be equal to one of the allowed values");
    } else {
        //No sortBy parameter given so revert to default
        data["sortBy"] = "SIGNATURES_DESC";
    }

    try {

        if (categoryId !== undefined) {
            if (!parseInt(categoryId)) { res.status(400).send("categoryId must be an integer"); } //Can't add to data yet because must check it exists
            //Check the category actually exists
            const categoryExists = await Petitions.categoryExists(categoryId);
            categoryExists.length === 0 ? res.status(400).send("categoryId doesn't exist") : data["categoryId"] = parseInt(categoryId);
        }

        const result = await Petitions.getPetitions(data);
        res.status(200).send(result);
    } catch (err) {
        res.status(500).send(`${err}`);
    }
};

exports.createPetition = async function (req, res) {

    const authToken = req.headers['x-authorization'];
    const title = req.body.title;
    let description = req.body.description;
    const categoryId = req.body.categoryId;
    const currentDate = new Date();
    let closingDate = req.body.closingDate;

    if (authToken === undefined || authToken === "") {
        res.status(401).send("Unauthorized");
        return;
    }

    if (title === undefined || typeof title !== 'string' || title === "") {
        res.status(400).send("Petition must have a title of type string");
        return;
    }

    if (description === undefined || typeof description !== 'string') { //Can be of length 0 according to reference server
        res.status(400).send("Petition must have a description of type string");
        return;
    }

    if (categoryId === undefined || categoryId !== parseInt(categoryId)) { //categoryId must be an integer
        res.status(400).send("Petition must have a categoryId of type integer");
        return;
    }

    try {
        //Check the authToken is valid
        const authResult = await Users.authorizeUser(authToken);
        if (authResult.length === 0) { //The user is not authorized
            res.status(401).send("Unauthorized");
            return;
        }
        const authorId = authResult[0]["user_id"];

        //closingDate error checking
        if (closingDate !== undefined) { //A closing date has been provided so check for errors
            if (typeof closingDate !== 'string') { //closingDate can be empty according to reference server (will cause 500 error)
                res.status(400).send("closingDate must be of type string");
                return;
            }

            closingDate = new Date(closingDate + " UTC"); //make closingDate UTC format (as per the schema)
            if (closingDate.getTime() !== closingDate.getTime()) { //The date string has been parsed incorrectly
                res.status(500).send("closingDate is invalid"); //Reference server returns 500 for any invalid closingDate
                return;
            }

            if (currentDate >= closingDate) {
                res.status(400).send("closingDate must be in the future");
                return;
            }
            /*The reference server doesn't check for invalid dates, such as the date being above the maximum
            * date that MySQL can handle (9999-12-31 23:59:59.999999) and dates that don't exist (i.e. 30th February on a
            * non-leap year), but instead returns 500 Internal Server Error when MySQL doesn't handle the request. Should
            * these be 400 Bad Request Errors?*/
        }

        const categoryExists = await Petitions.categoryExists(categoryId);
        if (!categoryExists) {
            res.status(400).send("Category doesn't exist");
            return;
        }

        const result = await Petitions.createPetition(title, description, authorId, categoryId, currentDate, closingDate);
        res.status(201).json({"petitionId": result.insertId}).send();

    } catch (err) {
        res.status(500).send(`${err}`);
    }
};

exports.getPetition = async function (req, res) {

    const id = req.params.id;

    try {
        const result = await Petitions.getPetition(id);
        if (result.length === 0) {
            res.status(404).send("Invalid Id");
            return;
        }

        const signatureCount = await Petitions.getSignatureCount(id);
        res.status(200).json({
            "petitionId": result[0]["petitionId"],
            "title": result[0]["title"],
            "category": result[0]["category"],
            "authorName": result[0]["authorName"],
            "signatureCount": signatureCount[0]["signatureCount"],
            "description": result[0]["description"],
            "authorId": result[0]["authorId"],
            "authorCity": result[0]["authorCity"],
            "authorCountry": result[0]["authorCountry"],
            "createdDate": result[0]["createdDate"],
            "closingDate": result[0]["closingDate"],
        }).send();

    } catch (err) {
        res.status(500).send(`${err}`);
    }
};

exports.updatePetition = async function (req, res) {
    //User can change the title, description, categoryId, and closingDate
    const petitionId = req.params.id;
    const authToken = req.headers['x-authorization'];

    if (authToken === undefined || authToken === "") {
        res.status(401).send("Unauthorized");
        return;
    }

    try {
        //Check the authToken is valid
        const authResult = await Users.authorizeUser(authToken);
        if (authResult.length === 0) { //The user is not authorized
            res.status(401).send("Unauthorized");
            return;
        }

        //Attempt to get current data of the petition
        const petitionDetails = await Petitions.getPetition(petitionId);
        if (petitionDetails.length === 0) {
            res.status(404).send("Invalid petitionId");
            return;
        }

        //Check authorId is the same as the currently authorized user
        const authorId = petitionDetails[0]["authorId"];
        if (!(authorId === authResult[0]["user_id"])) {
            res.status(403).send("Forbidden");
            return;
        }

        //We now know the user is in fact updating their own petition
        //Get the rest of the parameters from the request
        const title = req.body.title;
        const description = req.body.description;
        const categoryId = req.body.categoryId;
        const currentDate = new Date();
        let closingDate = req.body.closingDate;
        let values = [];
        let updateDataProvided = false;

        //Title error checking
        if (title !== undefined) {
            updateDataProvided = true;
            if (typeof title !== 'string' || title === "") {
                res.status(400).send("title should be a string and not shorter than 1 character");
                return;
            }
            values.push(title);
        } else {
            values.push(petitionDetails[0]["title"]); //No change
        }

        //Description error checking
        if (description !== undefined) {
            updateDataProvided = true;
            if (typeof description !== 'string') { //Description can be empty according to reference server
                res.status(400).send("description should be a string");
                return;
            }
            values.push(description);
        } else {
            values.push(petitionDetails[0]["description"]); //No change
        }

        //categoryId error checking
        if (categoryId !== undefined) {
            updateDataProvided = true;
            if (categoryId !== parseInt(categoryId)) {
                res.status(400).send("categoryId must be an integer");
                return;
            }

            const categoryExists = await Petitions.categoryExists(categoryId);
            if (!categoryExists) {
                res.status(400).send("Category doesn't exist");
                return;
            }
            values.push(categoryId);
        } else {
            values.push(petitionDetails[0]["categoryId"]);
        }

        //Check if the petition is closed
        //currentDate = new Date() (above)
        let currentClosingDate = petitionDetails[0]["closingDate"];
        if (currentClosingDate !== null) {
            if (currentDate > currentClosingDate) { //The petition has closed
                res.status(400).send("This petition has closed");
                return;
            }
        }

        //closingDate error checking
        if (closingDate !== undefined) { //A closing date has been provided so check for errors
            updateDataProvided = true;
            if (typeof closingDate !== 'string') { //closingDate can be empty according to reference server (will cause 500 error)
                res.status(400).send("closingDate must be of type string");
                return;
            }

            closingDate = new Date(closingDate + " UTC"); //make closingDate UTC format (as per the schema)
            if (closingDate.getTime() !== closingDate.getTime()) { //The date string has been parsed incorrectly
                res.status(500).send("closingDate is invalid"); //Reference server returns 500 for any invalid closingDate
                return;
            }

            if (currentDate >= closingDate) {
                res.status(400).send("closingDate must be in the future");
                return;
            }
            /*The reference server doesn't check for invalid dates, such as the date being above the maximum
            * date that MySQL can handle (9999-12-31 23:59:59.999999) and dates that don't exist (i.e. 30th February on a
            * non-leap year), but instead returns 500 Internal Server Error when MySQL doesn't handle the request. Should
            * these be 400 Bad Request Errors?*/
            values.push(closingDate);
        } else {
            values.push(petitionDetails[0]["closingDate"]);
        }

        values.push(petitionId);
        if (updateDataProvided) {
            await Petitions.updatePetition(values);
            res.status(200).send("Successfully updated");
        } else {
            res.status(400).send("No update data provided");
        }

    } catch (err) {
        res.status(500).send(`${err}`);
    }
};

exports.deletePetition = async function (req, res) {

    const petitionId = req.params.id;
    const authToken = req.headers['x-authorization'];

    if (authToken === undefined || authToken === "") {
        res.status(401).send("Unauthorized");
        return;
    }

    try {
        //Check the authToken is valid
        const authResult = await Users.authorizeUser(authToken);
        if (authResult.length === 0) { //The user is not authorized
            res.status(401).send("Unauthorized");
            return;
        }

        //Attempt to get current authorId of the petition (for checking the authorId
        const authorResult = await Petitions.getAuthorId(petitionId);
        if (authorResult.length === 0) {
            res.status(404).send("Invalid petitionId");
            return;
        }

        //Check authorId is the same as the currently authorized user
        const authorId = authorResult[0]["author_id"];
        if (!(authorId == authResult[0]["user_id"])) {
            res.status(403).send("Forbidden");
            return;
        }

        await Petitions.deletePetition(petitionId);
        res.status(200).send(`Petition ${petitionId} and signatures successfully deleted`);

    } catch (err) {
        res.status(500).send(`${err}`);
    }
};

exports.getCategories = async function (req, res) {
    try {
        const result = await Petitions.getCategories();
        res.status(200).send(result);
    } catch (err) {
        res.status(500).send(`${err}`);
    }
};