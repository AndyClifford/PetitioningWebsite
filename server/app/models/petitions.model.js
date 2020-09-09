const db = require('../../config/db');

exports.getPetitions = async function(data) {
    const conn = await db.getPool().getConnection();
    let query = "SELECT P.petition_id as petitionId, P.title, C.name as category, U.name as authorName, count(S.signatory_id) as signatureCount " +
        "FROM Petition as P join Category as C on P.category_id = C.category_id join User as U on P.author_id = U.user_id join Signature as S " +
        "on S.petition_id = P.petition_id where P.category_id = C.category_id";

    let values = [];
    if ('q' in data) { query +=  " and P.title like ?"; values.push("%" + data["q"] + "%"); }
    if ('categoryId' in data) { query += " and C.category_id = ?"; values.push(data["categoryId"]); }
    if ('authorId' in data) { query += " and P.author_id = ?"; values.push(data["authorId"]); }
    query += " GROUP BY P.petition_id";

    if (data["sortBy"] === "ALPHABETICAL_ASC") { query += " ORDER BY title ASC"; }
    if (data["sortBy"] === "ALPHABETICAL_DESC") { query += " ORDER BY title DESC"; }
    if (data["sortBy"] === "SIGNATURES_ASC") { query += " ORDER BY signatureCount ASC"; }
    if (data["sortBy"] === "SIGNATURES_DESC") { query += " ORDER BY signatureCount DESC"; }

    query += ", P.petition_id ASC"; //To make results identical to the reference server

    query += " LIMIT ?, ?";
    values.push(data["startIndex"]);
    values.push(data["count"]);

    const [ result ] = await conn.query( query, values );
    conn.release();
    return result;
};

// Get a single petition
exports.getPetition = async function(petitionId) {
    const conn = await db.getPool().getConnection();
    const query = "SELECT P.petition_id as petitionId, P.title, C.name as category, C.category_id as categoryId, U.name as authorName, P.description, U.user_id as authorId, "
        + "U.city as authorCity, U.country as authorCountry, P.created_date as createdDate, P.closing_date as closingDate FROM Petition as P, User as U, Category as C WHERE "
        + "P.petition_id = ? and P.category_id = C.category_id and U.user_id = P.author_id";
    const [ result ] = await conn.query( query, [ petitionId ] );
    conn.release();
    return result;
};

exports.getSignatureCount = async function(petitionId) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT count(*) as signatureCount from Signature where petition_id = ?';
    const [ result ] = await conn.query( query, [ petitionId ] );
    conn.release();
    return result;
};

exports.createPetition = async function( title, description, author_id, category_id, created_date, closing_date ) {
    const conn = await db.getPool().getConnection();
    const query = 'insert into Petition (title, description, author_id, category_id, created_date, closing_date) values (?, ?, ?, ?, ?, ?)';
    const [ result ] = await conn.query( query, [ title, description, author_id, category_id, created_date, closing_date ] );
    conn.release();
    return result;
};

exports.updatePetition = async function(values) {
    const conn = await db.getPool().getConnection();
    const query = "update Petition set title = ?, description = ?, category_id = ?, closing_date = ? where petition_id = ?";
    const [ result ] = await conn.query( query, values);
    conn.release();
    return result;
};

exports.deletePetition = async function(petitionId) {
    const conn = await db.getPool().getConnection();
    const query = 'delete from Petition where petition_id = ?';
    const [ result ] = await conn.query( query, [ petitionId ] );
    conn.release();
    return result;
};

exports.categoryExists = async function(category) {
    const conn = await db.getPool().getConnection();
    const query = 'select category_id from Category where category_id = ?';
    const [ result ] = await conn.query( query, [ category ] );
    conn.release();
    return result.length !== 0;
};

exports.getAuthorId = async function(petitionId) {
    const conn = await db.getPool().getConnection();
    const query = 'select author_id from Petition where petition_id = ?';
    const [ result ] = await conn.query( query, [ petitionId ] );
    conn.release();
    return result;
};

exports.getCategories = async function() {
    const conn = await db.getPool().getConnection();
    const query = 'select category_id as categoryId, name from Category';
    const [ result ] = await conn.query( query );
    conn.release();
    return result;
};

exports.petitionExists = async function(petitionId) {
    const conn = await db.getPool().getConnection();
    const query = "select petition_id from Petition where petition_id = ?";
    const [ result ] = await conn.query( query, [ petitionId ] );
    conn.release();
    return result;
}