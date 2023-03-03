var express = require('express');
var router = express.Router();
var SpotifyAPIData = require('../utils/SpotifyAPIData');

/* GET home page. */
router.get('/', function (req, res, next) {
  var session = req.session;

  if (session.data) {
    SpotifyAPIData.getProfileData(session.data).then(data => {
      res.render('pages/home', data);
    });
  } else {
    res.render('pages/index');
  }
});

module.exports = router;
