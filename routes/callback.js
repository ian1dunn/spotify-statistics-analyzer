var express = require('express');
var router = express.Router();
var request = require('request');
var SpotifyAPIData = require('../utils/SpotifyAPIData');

const { client_id, client_secret, redirect_uri, statekey } = require('../config.json');

/* GET home page. */
router.get('/', function (req, res, next) {
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[statekey] : null;

    if (state === null || state !== storedState) {
        res.redirect('error', {
            message: "State Mismatch",
            error: {
                status: "",
                stack: "State Mismatch"
            }
        });
    } else {
        res.clearCookie(statekey);

        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {

                // Store access token
                // res.cookie(accesstoken, 'Bearer ' + body.access_token);
                var session = req.session;
                // session.access_token = 'Bearer ' + body.access_token;
                session.data = new SpotifyAPIData(client_id, client_secret, body.access_token);

                res.redirect('/');
            } else {
                res.redirect('error', {
                    message: "Invalid Token",
                    error: {
                        status: "",
                        stack: "Invalid Token"
                    }
                });
            }
        });
    }
});

module.exports = router;