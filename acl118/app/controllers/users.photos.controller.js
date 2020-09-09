const UserPhotos = require('../models/users.photos.model');
const Users = require('../models/users.model');

exports.getUserPhoto = async function (req, res) {

    const id = req.params.id;

    try {
        const photoFilename = await UserPhotos.getUserPhotoFilename(id);
        if (photoFilename.length === 0 || photoFilename[0]["photo_filename"] === null) { //user or filename doesn't exist
            res.status(404).send();
            return;
        }

        const imageDetails = await UserPhotos.checkImageExists(photoFilename[0]["photo_filename"]);
        if (imageDetails.length === 0) {
            res.status(404).send("File doesn't exist");
            return;
        }

        //File exists
        res.status(200).contentType(imageDetails.mimeType).send(imageDetails.image);

    } catch (err) {
        res.status(500).send(`${err}`);
    }
};

exports.updateUserPhoto = async function (req, res) {

    const id = req.params.id;
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

        const photoFilename = await UserPhotos.getUserPhotoFilename(id);
        if (photoFilename.length === 0) {
            res.status(404).send("User doesn't exist");
            return;
        }

        //Check the authorized user is trying to update their own photo
        if (id != authResult[0]["user_id"]) {
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

        await UserPhotos.updateUserPhoto(id, req);
        if (hasPhoto) {
            res.status(200).send();
        } else {
            res.status(201).send();
        }

    } catch (err) {
        res.status(500).send(`${err}`);
    }
};

exports.deleteUserPhoto = async function (req, res) {

    const id = req.params.id;
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

        const photoFilename = await UserPhotos.getUserPhotoFilename(id);
        if (photoFilename.length === 0) { //The user doesn't exist
            res.status(404).send("User doesn't exist");
            return;
        }

        //Check the authorized user is trying to delete their own photo
        if (id != authResult[0]["user_id"]) {
            res.status(403).send("Forbidden");
            return;
        }

        if (photoFilename[0]["photo_filename"] === null) {
            res.status(404).send("Photo doesn't exist");
            return;
        }

        await UserPhotos.deleteUserPhoto(id, photoFilename[0]["photo_filename"]);
        res.status(200).send("Photo successfully deleted");

    } catch (err) {
        res.status(500).send(`${err}`);
    }
};