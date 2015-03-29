var fs = require("fs");
var loki = require("lokijs");
var mm = require("musicmetadata");

// Music directory
var MUSIC_DIR = fs.readFileSync("music_dir.txt", {encoding: "utf8"});

var parseSong = function(id, collection) {
  var songObj = {id: id};
  var readStream = fs.createReadStream(MUSIC_DIR + "/" + id);
  var parser = mm(readStream, function() {});
  // Get title
  parser.on("TIT2", function(result) {
    songObj.title = result;
  });
  // Get lead artist
  parser.on("TPE1", function(result) {
    songObj.artist = result;
  });
  // Get genre
  parser.on("TCON", function(result) {
    songObj.genre = result;
  });
  // Get BPM
  parser.on("TBPM", function(result) {
    songObj.bpm = Number(result);
  });
  // Get key
  parser.on("TKEY", function(result) {
    songObj.key = result;
  });
  // Save on close
  readStream.on("close", function() {
    console.log(songObj);
    // Insert song in collection
    collection.insert(songObj);
    // Save database
    db.saveDatabase();
  });
};
 
var db = new loki("db.json");
// Load existing database if it exists
db.loadDatabase({}, function() {
  // Get music collection if it exists
  var music = db.getCollection("music");
  // Create music collection if it doesn't exist
  if (!music) {
    music = db.addCollection("music", {indices: ["title", "bpm", "key"]});
  }

  // For every artist
  var artists = fs.readdirSync(MUSIC_DIR);
  while (artists.length > 0) {
    var artist = artists.pop();
    if (fs.lstatSync(MUSIC_DIR + "/" + artist).isDirectory()) {
      // For every album
      var albums = fs.readdirSync(MUSIC_DIR + "/" + artist);
      // TODO Make it applicable recursively e.g. when there are several discs per album
      while (albums.length > 0) {
        var album = albums.pop();
        if (fs.lstatSync(MUSIC_DIR + "/" + artist + "/" + album).isDirectory()) {
          // For every song
          var songs = fs.readdirSync(MUSIC_DIR + "/" + artist + "/" + album);
          while (songs.length > 0) {
            var song = songs.pop();
            // If mp3
            if (song.indexOf(".mp3") !== -1) {
              // Construct ID
              var id = artist + "/" + album + "/" + song;
              // If ID does not exist already insert song
              if (!music.findOne({id: id})) {
                parseSong(id, music);
              }
            }
          }
        }
      }
    }
  }
});
