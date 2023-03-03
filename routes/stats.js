var express = require('express');
var router = express.Router();
var SpotifyAPIData = require('../utils/SpotifyAPIData');
const util = require('util');

/* GET home page. */
router.get('/', async function (req, res, next) {
  res.redirect('/stats/short_term');
});

router.get('/:range', async function (req, res, next) {
  var session = req.session;
  var range = req.params.range;
  const ranges = ['short_term', 'medium_term', 'long_term'];

  if (session.data) {
    if (ranges.includes(range)) {
      const topTracks = SpotifyAPIData.getTopTracks(session.data, range);
      const topArtists = SpotifyAPIData.getTopArtists(session.data, range);
      const topGenres = SpotifyAPIData.getTopGenres(session.data, range);

      const stats = await Promise.all([topTracks, topArtists, topGenres]);

      // console.log(util.inspect(stats[2], { depth: null, colors: true }));
      res.render('pages/stats', { tracks: stats[0], artists: stats[1], genres: stats[2] });
    } else {
      res.redirect('/stats')
    }
  } else {
    res.redirect('/');
  }
});

module.exports = router;
