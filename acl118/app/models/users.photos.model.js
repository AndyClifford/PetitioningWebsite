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

exports.getUserPhotoFilename = async function (id) {
    const conn = await db.getPool().getConnection();
    const query = 'select photo_filename from User where user_id = ?';
    const [ result ] = await conn.query(query, [ id ]);
    conn.release();
    return result;
};

exports.updateUserPhoto = async function (id, req) {
    //Create filename from date, user_id and mimeType
    const currentDate = new Date().getTime();
    const extension = mime.extension(req.headers['content-type']);
    const filename = `user_photo_${id}_${currentDate}.${extension}`;

    //Save the buffer to filesystem
    fs.writeFile(photoDirectory + filename, req.body);

    const conn = await db.getPool().getConnection();
    const query = 'update User set photo_filename = ? where user_id = ?';
    const [ result ] = await conn.query(query, [ filename, id ]);
    conn.release();
    return result;
};

exports.deleteUserPhoto = async function (id, filename) {

    //Delete the photo from the directory
    if (await fs.exists(photoDirectory + filename)) {
        await fs.unlink(photoDirectory + filename);
    }

    const conn = await db.getPool().getConnection();
    const query = 'update User set photo_filename = null where user_id = ?';
    const [ result ] = await conn.query(query, [ id ]);
    conn.release();
    return result;
};