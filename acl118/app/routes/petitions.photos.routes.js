const petitionPhotos = require('../controllers/petitions.photos.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/petitions/:id/photo')
        .get(petitionPhotos.getPetitionPhoto)
        .put(petitionPhotos.updatePetitionPhoto);

};