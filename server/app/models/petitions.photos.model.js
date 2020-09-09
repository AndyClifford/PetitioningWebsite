const db = require('../../config/db');
const fs = require('mz/fs');
const mime = require('mime-types');
const photoDirectory = './storage/photos/';

exports.checkImageExists = async function(filename) {
    if (await fs.exists(photoDirectory + filename)) {
        const image = await fs.readFile(photoDirectory + filename);
        const mimeType = mime.lookup(filename);
        return {image, mimeType};
    }
    return [];
};

exports.getPetitionPhotoFilename = async function (petitionId) {
    const conn = await db.getPool().getConnection();
    const query = 'select photo_filename from Petition where petition_id = ?';
    const [ result ] = await conn.query(query, [ petitionId ]);
    conn.release();
    return result;
};

exports.updatePetitionPhoto = async function (petitionId, req) {
    //Create filename from date, user_id and mimeType
    const currentDate = new Date().getTime();
    const extension = mime.extension(req.headers['content-type']);
    const filename = `petition_photo_${petitionId}_${currentDate}.${extension}`;

    //Save the buffer to filesystem
    fs.writeFile(photoDirectory + filename, req.body);

    const conn = await db.getPool().getConnection();
    const query = "update Petition set photo_filename = ? where petition_id = ?";
    const [ result ] = await conn.query(query, [ filename, petitionId ]);
    conn.release();
    return result;
};