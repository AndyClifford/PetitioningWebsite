const db = require('../../config/db');

exports.getSignatures = async function(petitionId) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT S.signatory_id as signatoryId, U.name, U.city, U.country, S.signed_date as signedDate '
        + 'FROM Signature as S, User as U where S.signatory_id = U.user_id and S.petition_id = ? order by signedDate';
    const [ result ] = await conn.query( query, [ petitionId ] );
    conn.release();
    return result;
};

exports.signPetition = async function(petitionId, userId, date) {
    const conn = await db.getPool().getConnection();
    const query = 'insert into Signature (signatory_id, petition_id, signed_date) values (?, ?, ?)';
    const [ result ] = await conn.query( query, [ userId, petitionId, date ] );
    conn.release();
    return result;
};

exports.deleteSignature = async function(petitionId, userId) {
    const conn = await db.getPool().getConnection();
    const query = 'delete from Signature where petition_id = ? and signatory_id = ?';
    const [ result ] = await conn.query( query, [ petitionId, userId ] );
    conn.release();
    return result;
};

exports.hasSigned = async function(petitionId, userId) {
    const conn = await db.getPool().getConnection();
    const query = 'select signatory_id from Signature where petition_id = ? and signatory_id = ?';
    const [ result ] = await conn.query( query, [ petitionId, userId ] );
    conn.release();
    return result;
}