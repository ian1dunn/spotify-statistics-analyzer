var express = require('express');
var router = express.Router();

const { generateRandomString } = require('../utils/utils');
const { client_id, redirect_uri, statekey, scope } = require('../config.json');

/* GET home page. */
router.get('/', function (req, res, next) {
    var state = generateRandomString(16);
    res.cookie(statekey, state);

    // your application requests authorization
    res.redirect('https://accounts.spotify.com/authorize?' +
        new URLSearchParams({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});

module.exports = router;