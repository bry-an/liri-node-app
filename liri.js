require("dotenv").config();
var Spotify = require("node-spotify-api");
var moment = require("moment");
var request = require("request");
var keys = require('./keys')
var fs = require('fs');

var spotify = new Spotify(keys.spotify);

//global input variables
var command = process.argv[2];
var query = process.argv.slice(3).join("+");



var BandsInTown = function (artist) {
    if (process.argv.length == 3)
        console.log("Please specify an artist or band name.")
    else this.artist = artist;
    this.get = function () {
        request("https://rest.bandsintown.com/artists/" + this.artist + "/events?app_id=codingbootcamp",
            (error, response, body) => {
                if (error)
                    console.log("Sorry, there was an error: " + error);
                if (response.statusCode == 200) {
                    parsedBody = JSON.parse(body);
                    displayConcertInfo(parsedBody);
                }
            })
    }
}

var MovieInfo = function (movie) {
    if (process.argv.length == 3)
        this.movie = "Mr. Nobody";
    else this.movie = movie;
    this.get = function () {
        request("https://www.omdbapi.com/?apikey=trilogy&t=" + this.movie,
            (error, response, body) => {
                if (error)
                    console.log("Sorry, there was an error: " + error);
                if (response.statusCode == 200) {
                    var movieObj = JSON.parse(body);
                    displayMovieInfo(movieObj);
                }
            });
    }
}

var SpotifyInfo = function (song) {
    this.song = song;
    console.log('query inside spotinfo', query)
    this.get = function () {
        spotify
            .search({ type: 'track', query: this.song })
            .then(response => {
                displaySongInfo(response);
            })
            .catch(err => {
                console.log("Sorry, there was an error: " + err);
            })
    }
}

function whatItSays() {
    fs.readFile('random.txt', 'utf8', (err, data) => {
        if (err)
            console.log("Sorry, there was an error: " + error);
        var commandArr = data.split(",");
        randomCommand = commandArr[0];
        randomQuery = commandArr[1];
        console.log(randomCommand, randomQuery)
        executeCommand(randomCommand, randomQuery);
    });
}


function executeCommand(command, query) {
    switch (command) {
        case "concert-this":
            var bands = new BandsInTown(query);
            bands.get();
            break;

        case "movie-this":
            var movie = new MovieInfo(query);
            movie.get();
            break;

        case "spotify-this-song":
        console.log("inside switch cmd que", command, query)
        if (!query)
        query = "ace of base the sign";
            var tune = new SpotifyInfo(query);
            tune.get();
            break;

        case "do-what-it-says":
            whatItSays();
            break;
    }
}

function displayConcertInfo(response) {
    if (response.length == 0)
        console.log("Hmmm, it doesn't look like there are any upcoming shows at the moment. Try another artist?")
    else
        console.log("Okay, I found the following information on upcoming shows:");
    response.forEach(concert => {
        var venueName = concert.venue.name;
        var venueCity = concert.venue.city;
        var venueCountry = concert.venue.country;
        var venueRegion = concert.venue.region;
        var dateAndTime = moment(concert.datetime).format('MM/DD/YYYY [at] hh:mma');
        if (venueRegion !== "")
            console.log("On " + dateAndTime + " at " + venueName + " in " + venueCity + ", " + venueRegion + ", " + venueCountry);
        else
            console.log("On " + dateAndTime + " at " + venueName + " in " + venueCity + ", " + venueCountry);
        console.log();
        console.log("=========OR=========");

    });

}

function displayMovieInfo(movie) {
    var title = movie.Title;
    var year = movie.Year;
    var ratingsArr = movie.Ratings;
    var getImdbRating = function (ratingsArr) {
        for (var i = 0; i < ratingsArr.length; i++) {
            if (ratingsArr[i].Source == 'Internet Movie Database')
                return ratingsArr[i].Value;
        }
    };

    var getRtRating = function (ratingsArr) {
        for (var i = 0; i < ratingsArr.length; i++) {
            if (ratingsArr[i].Source == 'Rotten Tomatoes')
                return ratingsArr[i].Value;
        }
    };
    var imdbRating = getImdbRating(ratingsArr);
    var rtRating = getRtRating(ratingsArr);

    var country = movie.Country;
    var lang = movie.Language;
    var plot = movie.Plot;
    var actors = movie.Actors;
    var vowels = ['A', 'E', 'I', 'O', 'U'];
    if (country = 'USA')
        country = "The United States";

    console.log("Okay, I found the following information about that movie: ");
    if (vowels.indexOf(lang[0]) !== -1)
        console.log(title + " is an " + lang + " language movie produced in " + country + " in " + year + " starring " + actors + ".");
    else
        console.log(title + " is a " + lang + " language movie produced in " + country + " in " + year + " starring " + actors + ".");
    console.log("Synopsis: " + plot);
    if (imdbRating)
        console.log("It received " + imdbRating + " from IMDb.");
    if (rtRating)
        console.log("It received " + rtRating + " from Rotten Tomatoes.");
}

function displaySongInfo (song) {
    
    var artist = song.tracks.items[0].album.artists[0].name;
    var songName = song.tracks.items[0].name;
    var previewURL = song.tracks.items[0].preview_url;
    var albumName = song.tracks.items[0].album.name;
    var releaseYear = song.tracks.items[0].album.release_date.slice(0, 4);
    console.log("Okay, I found the following information about that song: ");
    console.log(songName + " is a song released in " + releaseYear + " by " + artist + ".");
    console.log("It is a track on the album " + albumName + ".");
    if (previewURL)
    console.log("For a preview of " + songName + ", visit: " + previewURL);
}

executeCommand(command, query);