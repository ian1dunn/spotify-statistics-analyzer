var request = require('request');

/**
 * A class that holds serializable data corresponding to an individual user and different client applications.
 */
class SpotifyAPIData {
    /**
     * The constructor of the SpotifyAPIData class
     * 
     * @param String clientID The client ID for the application
     * @param String clientSecret The client secret for the application
     * @param String accessToken The access token for the user (obtained through OAUTH API flow)
     */
    constructor(clientID, clientSecret, accessToken) {
        if (!(clientID && clientSecret && accessToken)) {
            throw new Error("Missing arguments!");
        }
        this.clientID = clientID;
        this.clientSecret = clientSecret;
        this.accessToken = 'Bearer ' + accessToken;
    }

    /**
     * Get the profile data of a user
     * 
     * @param SpotifyAPIData data The data used to make the API request
     * 
     * @returns A JSON object with several fields describing the Spotify user
     */
    static async getProfileData(data) {
        var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': data.accessToken },
            json: true
        };

        // Use the access token to access the Spotify Web API
        const result = await new Promise((resolve, reject) => {
            request.get(options, function (err, res, body) {
                return void err ? reject(err) : resolve(body);
            });
        });

        return result;
    }

    /**
     * Get the top tracks of a user
     * 
     * @param SpotifyAPIData data The data used to make the API request
     * @param String timeRange The time range to query the request from (long_term - all time, medium_term - ~6 months, short_term - last 4 weeks)
     * 
     * @returns A JSON object with several fields describing the Spotify user's top tracks
     */
    static async getTopTracks(data, timeRange) {
        var options = {
            url: 'https://api.spotify.com/v1/me/top/tracks',
            qs: {
                limit: 50,
                time_range: timeRange
            },
            headers: { 'Authorization': data.accessToken },
            json: true
        };

        const result = await new Promise((resolve, reject) => {
            request.get(options, function (err, res, body) {
                if (err) {
                    return reject(err);
                }

                var returnObj = [];

                body.items.forEach(track => {
                    var artistList = [];

                    track.artists.forEach(artist => {
                        artistList.push({
                            url: artist.external_urls.spotify,
                            name: artist.name
                        })
                    })

                    returnObj.push({
                        name: track.name,
                        explicit: track.explicit,
                        url: track.external_urls.spotify,
                        coverUrl: track.album.images[1].url,
                        artists: artistList
                    });
                });

                return resolve(returnObj);
            });
        });

        return result;
    }

    /**
     * Get the top artists of a user
     * 
     * @param SpotifyAPIData data The data used to make the API request
     * @param String timeRange The time range to query the request from (long_term - all time, medium_term - ~6 months, short_term - last 4 weeks)
     * 
     * @returns A JSON object with several fields describing the Spotify user's top artists
     */
    static async getTopArtists(data, timeRange) {
        var options = {
            url: 'https://api.spotify.com/v1/me/top/artists',
            qs: {
                limit: 50,
                time_range: timeRange
            },
            headers: { 'Authorization': data.accessToken },
            json: true
        };

        const result = await new Promise((resolve, reject) => {
            request.get(options, function (err, res, body) {
                if (err) {
                    return reject(err);
                }

                var returnObj = [];

                body.items.forEach(artist => {
                    returnObj.push({
                        name: artist.name,
                        url: artist.external_urls.spotify,
                        coverUrl: artist.images[1].url,
                        followers: artist.followers.total,
                        genres: artist.genres,
                        popularity: artist.popularity
                    });
                });

                return resolve(returnObj);
            });
        });

        return result;
    }

    /**
     * Get the top genres of a user by extrapolating the data from the user's top artists
     * 
     * @param SpotifyAPIData data The data used to make the API request
     * @param String timeRange The time range to query the request from (long_term - all time, medium_term - ~6 months, short_term - last 4 weeks)
     * 
     * @returns A JSON object with several fields describing the Spotify user's top genres
     */
    static async getTopGenres(data, timeRange) {
        // TODO: Could get artists corresponding to a genre?
        const artists = await this.getTopArtists(data, timeRange);

        // Total up all genres
        const genres = {};
        let total = 0;
        artists.forEach(artist => {
            artist.genres.forEach(genre => {
                total++;
                if (genre in genres) {
                    genres[genre]++;
                } else {
                    genres[genre] = 1;
                }
            })
        });

        // Convert object to array and sort in descending order (more popular genres first)
        let sorted = [];
        for (let genre in genres) {
            sorted.push({
                'genre': genre,
                'total': genres[genre],
                'percentage': ((genres[genre] / total) * 100).toFixed(1)
            })
        }

        sorted.sort((a, b) => {
            return b.total - a.total;
        });

        return sorted;
    }
}

module.exports = SpotifyAPIData;