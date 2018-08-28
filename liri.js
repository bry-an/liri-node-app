require("dotenv").config();
var Spotify = require("node-spotify-api");
var moment = require("moment");
var request = require("request");
var keys = require('./keys')

//should be able to access keys with:
var spotify = new Spotify(keys.spotify)

console.log(spotify);