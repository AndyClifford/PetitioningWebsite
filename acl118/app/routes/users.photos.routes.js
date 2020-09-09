const userPhotos = require('../controllers/users.photos.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/users/:id/photo')
        .get(userPhotos.getUserPhoto)
        .put(userPhotos.updateUserPhoto)
        .delete(userPhotos.deleteUserPhoto);

};