const Users = require('../models/users.model');
const Backdoor = require('../models/backdoor.model');
const bcrypt = require('bcryptjs');
const randomToken = require('random-token');

exports.createUser = async function (req, res) {

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const city = req.body.city;
    const country = req.body.country;

    if (name === undefined || typeof name !== 'string' || name === "") { //name is missing so bad request
        res.status(400).send("Must provide a name of type string");
        return;
    }

    if (email === undefined || typeof email !== 'string' || email.length < 3 || !(email.includes('@'))) {
        res.status(400).send("Invalid email address");
        return;
    }

    if (password === undefined || typeof password !== 'string' || password === "") {
        res.status(400).send("Must provide a password");
        return;
    }

    if (city !== undefined) {
        if (typeof city !== 'string' || city === "") {
            res.status(400).send("City (if provided) must be a string and not shorter than 1 character")
        }
    }

    if (country !== undefined) {
        if (typeof country !== 'string' || country === "") {
            res.status(400).send("Country (if provided) must be a string and not shorter than 1 character")
        }
    }

    try {
        const emailExists = await Users.checkEmailExists(email);
        if (emailExists.length !== 0) {
            res.status(400).send("Email address already in use");
            return;
        }

        const result = await Users.createUser(name, email, password, city, country);
        res.status(201).json({"userId": result.insertId}).send();

    } catch (err) {
        res.status(500).send(`${err}`);
    }
};

exports.login = async function (req, res) {

    const email = req.body.email;
    const password = req.body.password;

    if (email === undefined || typeof email !== 'string' || email.length < 3 || !(email.includes('@'))) {
        res.status(400).send("Must provide a valid email address of type string");
        return;
    }

    if (password === undefined || typeof password !== 'string' || password === "") {
        res.status(400).send("Must provide a password of type string");
        return;
    }

    try {

        const userDetails = await Users.getIdEmailPassword(email);
        if (userDetails.length === 0) {
            res.status(400).send("Email not registered");
            return;
        }

        const userId = userDetails[0]["user_id"];
        const currentHash = userDetails[0]["password"];

        if (bcrypt.compareSync(password, currentHash)) { //The entered password matches the current hash
            const authToken = randomToken(32);
            await Users.updateAuthToken(userId, authToken);
            res.status(200).json({"userId": userId, "token": authToken}).send();
        } else {
            res.status(400).send("Incorrect password");
        }

    } catch (err) {
        res.status(500)
            .send(`${err}`);
    }
};

exports.logout = async function (req, res) {

    const authToken = req.headers['x-authorization'];
    if (authToken === undefined || authToken === "") {
        res.status(401).send("Unauthorized");
        return;
    }

    try {
        const authResult = await Users.authorizeUser(authToken);
        if (authResult.length === 0) { //authToken doesn't match that of any user, therefore unauthorized
            res.status(401).send("Unauthorized");
            return;
        }

        const userId = authResult[0]["user_id"];
        await Users.deleteAuthToken(userId);
        res.status(200).send("Successfully logged out");

    } catch (err) {
        res.status(500).send(`${err}`);
    }
};

exports.getUser = async function (req, res) {

    const id = req.params.id;
    const authToken = req.headers['x-authorization'];
    let hasToken = true;
    let showEmail = false;

    if (authToken === undefined || authToken === "") {
        hasToken = false;
    }

    try {

        if (hasToken) { //Check if the user is authenticated
            const authResult = await Users.authorizeUser(authToken);
            if (authResult.length === 0) { //The user is not authorized so don't show the requested users email
                showEmail = false;
            } else {
                //Check that the id returned by authResult is equal to the parameter id
                if (id == authResult[0]["user_id"]) {
                    showEmail = true;
                } else {
                    showEmail = false;
                }
            }
        }

        const result = await Users.getUser(id);

        if (result.length === 0) {
            res.status(404).send("User doesn't exist");
        } else {
            if (showEmail) {
                res.status(200).json({"name": result[0]["name"], "city": result[0]["city"], "country": result[0]["country"], "email": result[0]["email"]}).send();
            } else {
                res.status(200).json({"name": result[0]["name"], "city": result[0]["city"], "country": result[0]["country"]}).send();
            }
        }
    } catch (err) {
        res.status(500)
            .send(`${err}`);
    }
};

exports.updateUser = async function (req, res) {

    const id = req.params.id;
    const authToken = req.headers['x-authorization'];

    if (authToken === undefined || authToken === "") {
        res.status(401).send("Unauthorized");
        return;
    }

    try {
        const authResult = await Users.authorizeUser(authToken);
        if (authResult.length === 0) { //The user is not authorized
            res.status(401).send("Unauthorized");
            return;
        }

        //Check if the user exists by attempting to get all of their details
        const userDetails = await Users.getUserDetailsAll(id);
        if (userDetails.length === 0) { //User with given id doesn't exist in database
            res.status(404).send("User doesn't exist");
            return;
        }

        //The user is authorized but they still might be trying to update another users details
        if (authResult[0]["user_id"] != id) { //Trying to update another user (forbidden)
            res.status(403).send("Forbidden");
            return;
        }

        //We now know the user is in fact updating their own profile
        //Get the rest of the parameters from the request
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const currentPassword = req.body.currentPassword;
        const city = req.body.city;
        const country = req.body.country;
        let values = [];
        let updateDataProvided = false;

        //Name error checking
        if (name !== undefined) {
            updateDataProvided = true;
            if (typeof name !== 'string' || name === "") {
                res.status(400).send("Name should be a string and not shorter than 1 character");
                return;
            }
            values.push(name);
        } else {
            values.push(userDetails[0]["name"]); //No change
        }

        //Email error checking
        if (email !== undefined) {
            updateDataProvided = true;
            let emailIsValid = await Users.validateEmail(email);
            if (!emailIsValid) {
                res.status(400).send("Email must be a valid email of type string");
                return;
            }
            //Provided email is valid, so check it isn't already registered
            const emailExists = await Users.checkEmailExists(email);
            if (emailExists.length !== 0) { //The email exists in the database
                //Check if it belongs to another user
                if (emailExists[0]["user_id"] != id) {
                    res.status(400).send("The email is already in use");
                    return;
                }
            }
            //The email doesn't exist in the database, or belongs to the current user
            values.push(email);
        } else {
            values.push(userDetails[0]["email"]); //No change
        }

        //Password error checking
        if (password !== undefined) {
            updateDataProvided = true;

            if (typeof password !== 'string' || password === "") {
                res.status(400).send("Password must be a string and can't be empty");
                return;
            }

            if (typeof currentPassword !== 'string') {
                res.status(400).send("currentPassword must be a string");
                return;
            }

            //A valid currentPassword has been provided, so check it is correct
            if (!(bcrypt.compareSync(currentPassword, userDetails[0]["password"]))) {
                res.status(400).send("Incorrect current password");
                return;
            }

            //currentPassword is correct, so hash the new password
            const salt = bcrypt.genSaltSync(10);
            const newHash = bcrypt.hashSync(password, salt);
            values.push(newHash);
        } else {
            values.push(userDetails[0]["password"]);
        }

        if (city !== undefined) {
            updateDataProvided = true;
            if (city === "" || typeof city !== 'string') {
                res.status(400).send("City should be a string and not shorter than 1 character");
                return;
            }
            values.push(city);
        } else {
            values.push(userDetails[0]["city"]); //No change
        }

        //Spec says
        if (country !== undefined) {
            updateDataProvided = true;
            if (country === "" || typeof country !== 'string') {
                res.status(400).send("Country should be a string and not shorter than 1 character");
                return;
            }
            values.push(country);
        } else {
            values.push(userDetails[0]["country"]); //No change
        }

        values.push(id);
        if (updateDataProvided) {
            await Users.updateUser(values);
            res.status(200).send("Successfully updated");
        } else {
            res.status(400).send("No update data provided");
        }

    } catch (err) {
        res.status(500).send(`${err}`);
    }
};
