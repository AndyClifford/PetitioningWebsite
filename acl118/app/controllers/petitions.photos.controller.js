const PetitionPhotos = require('../models/petitions.photos.model');
const Users = require('../models/users.model');
const Petitions = require('../models/petitions.model');

exports.getPetitionPhoto = async function (req, res) {

    const petitionId = req.params.id;

    try {
        const photoFilename = await PetitionPhotos.getPetitionPhotoFilename(petitionId);
        if (photoFilename.length === 0 || photoFilename[0]["photo_filename"] === null) { //petition or filename doesn't exist
            res.status(404).send();
            return;
        }

        const imageDetails = await PetitionPhotos.checkImageExists(photoFilename[0]["photo_filename"]);
        if (imageDetails.length === 0) {
            res.status(404).send("Petition doesn't exist");
            return;
        }

        //File exists
        res.status(200).contentType(imageDetails.mimeType).send(imageDetails.image);

    } catch (err) {
        res.status(500).send(`${err}`);
    }
};

exports.updatePetitionPhoto = async function (req, res) {

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

        const photoFilename = await PetitionPhotos.getPetitionPhotoFilename(petitionId);
        if (photoFilename.length === 0) {
            res.status(404).send("Petition doesn't exist");
            return;
        }

        const authorId = await Petitions.getAuthorId(petitionId);
        //Check the authorized user is trying to update their own photo
        if (authResult[0]["user_id"] !== authorId[0]["author_id"]) {
            res.status(403).send("Forbidden");
            return;
        }

        //Check the contentType is one of the allowed values
        if (!(['image/png', 'image/jpeg', 'image/gif'].includes(req.headers['content-type']))) {
            res.status(400).send("Photo must be image/png, image/jpeg or image/gif");
            return;
        }

        //Authorized user is trying to update their own photo
        let hasPhoto = true;
        if (photoFilename[0]["photo_filename"] === null) { //no current photo
            hasPhoto = false;
        }

        await PetitionPhotos.updatePetitionPhoto(petitionId, req);
        if (hasPhoto) {
            res.status(200).send();
        } else {
            res.status(201).send();
        }

    } catch (err) {
        res.status(500).send(`${err}`);
    }
};