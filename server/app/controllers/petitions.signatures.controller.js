const PetitionSignatures = require('../models/petitions.signatures.model');
const Users = require('../models/users.model');
const Petitions = require('../models/petitions.model');

exports.getSignatures = async function (req, res) {
    const petitionId = req.params.id;
    try {
        //Check petition exists
        const petitionExists = await Petitions.petitionExists(petitionId);
        if (petitionExists.length === 0) {
            res.status(400).send("Invalid petitionId");
            return;
        }
        //Petition exists, so get signatures
        const result = await PetitionSignatures.getSignatures(petitionId);
        res.status(200).send(result);

    } catch (err) {
        res.status(500).send(`${err}`);
    }
};

exports.deleteSignature = async function (req, res) {

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
        const userId = authResult[0]["user_id"]; //The currently authorized user

        //Check if the user created the petition
        const petitionDetails = await Petitions.getPetition(petitionId);
        if (petitionDetails.length === 0) {
            res.status(404).send("Petition doesn't exist");
            return;
        }

        const authorId = petitionDetails[0]["authorId"];
        if (userId == authorId) { //The user is trying to delete their signature from their own petition (FORBIDDEN)
            res.status(403).send("Can't delete signature from your own petition");
            return;
        }

        const hasSigned = await PetitionSignatures.hasSigned(petitionId, userId);
        if (hasSigned.length === 0) {
            res.status(403).send("You haven't signed this petition");
            return;
        }

        const currentDate = new Date();
        const closingDate = petitionDetails[0]["closingDate"];
        if (closingDate !== null) {
            if (currentDate > closingDate) { //The petition has closed
                res.status(403).send("This petition has closed");
                return;
            }
        }

        await PetitionSignatures.deleteSignature(petitionId, userId);
        res.status(200).send("Signature deleted");

    } catch (err) {
        res.status(500).send(`${err}`);
    }
};

exports.signPetition = async function (req, res) {

    const petitionId = req.params.id;
    const authToken = req.headers['x-authorization'];

    if (authToken === undefined || authToken ==="") {
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

        //Check if the petition exists
        const petitionDetails = await Petitions.getPetition(petitionId);
        if (petitionDetails.length === 0) {
            res.status(404).send("Petition doesn't exist");
            return;
        }

        const userId = authResult[0]["user_id"];
        const hasSigned = await PetitionSignatures.hasSigned(petitionId, userId);
        if (hasSigned.length !== 0) {
            res.status(403).send("You have already signed this petition");
            return;
        }

        const currentDate = new Date();
        const closingDate = petitionDetails[0]["closingDate"];
        if (closingDate !== null) {
            if (currentDate > closingDate) { //The petition has closed
                res.status(403).send("This petition has closed");
                return;
            }
        }

        await PetitionSignatures.signPetition(petitionId, userId, currentDate);
        res.status(201).send("Petition signed");

    } catch (err) {
        res.status(500).send(`${err}`);
    }
};