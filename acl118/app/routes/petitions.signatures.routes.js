const petitionSignatures = require('../controllers/petitions.signatures.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/petitions/:id/signatures')
        .get(petitionSignatures.getSignatures)
        .post(petitionSignatures.signPetition)
        .delete(petitionSignatures.deleteSignature);
};