var express = require('express');
var router = express.Router();

const { access_token } = require('../config.json');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.clearCookie('connect.sid');
    req.session.destroy();
    return res.redirect('/');
});

module.exports = router;