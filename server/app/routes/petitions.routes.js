const petitions = require('../controllers/petitions.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/petitions')
        .get(petitions.getPetitions)
        .post(petitions.createPetition);

    app.route(app.rootUrl + '/petitions/categories')
        .get(petitions.getCategories);

    app.route(app.rootUrl + '/petitions/:id')
        .get(petitions.getPetition)
        .patch(petitions.updatePetition)
        .delete(petitions.deletePetition);

};