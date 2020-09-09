const db = require('../../config/db');
var randomToken = require('random-token');
var bcrypt = require('bcryptjs');

exports.createUser = async function(name, email, password, city, country) {
    const conn = await db.getPool().getConnection();
    const insertQuery = 'insert into User (name, email, password, city, country) values (?, ?, ?, ?, ?)';

    //Hash the password
    var salt = bcrypt.genSaltSync(10);
    var hashedPassword = bcrypt.hashSync(password, salt);

    const [ result ] = await conn.query( insertQuery, [ name, email, hashedPassword, city, country ] );
    conn.release();
    return result;
};

exports.authorizeUser = async function(authToken) {
    const conn = await db.getPool().getConnection();
    const query = "select user_id from User where auth_token = ?";
    const [ result ] = await conn.query( query, [ authToken ] );
    conn.release();
    return result;
};

exports.updateAuthToken = async function(id, authToken) {
    const conn = await db.getPool().getConnection();
    const query = "update User set auth_token = ? where user_id = ?";
    const [ result ] = await conn.query( query, [ authToken, id ] );
    conn.release();
    return result;
};

exports.deleteAuthToken = async function(userId) {
    const conn = await db.getPool().getConnection();
    const query = 'update User set auth_token = null where user_id = ?';
    const [ result ] = await conn.query( query, [ userId ] );
    conn.release();
    return result;
};

exports.getUser = async function( id ) {
    const conn = await db.getPool().getConnection();
    const query = 'select name, email, city, country from User where user_id = ?';
    const [ result ] = await conn.query(query, [ id ]);
    conn.release();
    return result;
};

exports.getUserDetailsAll = async function( id ) {
    const conn = await db.getPool().getConnection();
    const query = 'select name, email, password, city, country from User where user_id = ?';
    const [ result ] = await conn.query(query, [ id ]);
    conn.release();
    return result;
};

exports.updateUser = async function(values) {
    const conn = await db.getPool().getConnection();
    const query = "update User set name = ?, email = ?, password = ?, city = ?, country = ? where user_id = ?";
    const [ result ] = await conn.query( query, values );
    conn.release();
    return result;
};

exports.getPassword = async function(id) {
    const conn = await db.getPool().getConnection();
    const query = 'select password from User where user_id = ?';
    const [ result ] = await conn.query( query, [ id ] );
    conn.release();
    return result;
};

exports.checkEmailExists = async function(email) {
    const conn = await db.getPool().getConnection();
    const query = "select user_id from User where email = ?";
    const [ result ] = await conn.query( query, [ email ] );
    conn.release();
    return result;
};

exports.checkUserExists = async function(id) {
    const conn = await db.getPool().getConnection();
    const query = "select user_id from User where user_id = ?";
    const [ result ] = await conn.query( query, [ id ] );
    conn.release();
    return result;
};

exports.getIdEmailPassword = async function(email) {
    const conn = await db.getPool().getConnection();
    const query = "select user_id, email, password from User where email = ?";
    const [ result ] = await conn.query( query, [ email ] );
    conn.release();
    return result;
};

exports.validateEmail = async function(email) {
    if (typeof email === 'string') {
        return !(email.length < 3 || !(email.includes('@')));
    }
    return false;
};