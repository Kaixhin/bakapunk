var loki = require("lokijs");
var readline = require("readline");
require("colors");

// Distance metric based on key (ignoring minor/major)
var keyDist = function(a, b) {
  // Convert to radians
  a = a * Math.PI / 6;
  b = b * Math.PI / 6;
  return Math.sqrt(Math.pow(Math.cos(a) - Math.cos(b), 2) + Math.pow(Math.sin(a) - Math.sin(b), 2));
};

// Functional for key distance (ignoring minor/major)
var keyFilt = function(song) {
  var key = Number(song.key.replace("m", ""));
  var fn = function(obj) {
    // If no key, add 2
    if (!obj.key) {
      obj.dist += 1;
    } else {
      var oKey = Number(obj.key.replace("m", ""));
      obj.dist += keyDist(key, oKey);
    }
    return;
  };
  return fn;
};

// Find similar songs
var findSongs = function(song, collection) {
  // First create a ResultSet filtered by BPM
  var results = collection.chain().find({bpm: {$gte: song.bpm - 5}}).find({bpm: {$lte: song.bpm + 5}}).copy();
  // Add distance metric based on BPM
  results.update(function(obj) {obj.dist = Math.abs(song.bpm - obj.bpm);return;});
  // Add distance metric based on key
  var filtFn = keyFilt(song);
  results.update(filtFn);
  // Sort by distance and return at most 50 results
  var songs = results.simplesort("dist").limit(50).data();
  // Display results
  if (songs.length === 0) {
    console.log("No suggestions.");
  } else {
    var bpmColor = "";
    for (var i = 0; i < songs.length; i++) {
      if (songs[i].bpm > song.bpm) {
        bpmColor = "green";
      } else if (songs[i].bpm < song.bpm) {
        bpmColor = "red";
      } else {
        bpmColor = "grey";
      }
      console.log("[" + i + "]", songs[i].artist.blue, "-", songs[i].title.blue, "(" + songs[i].dist + ") |",
                  "BPM:"[bpmColor], songs[i].bpm.toString()[bpmColor], "|", "KEY:".cyan, songs[i].key.cyan);
    }
  }
};

// Create readline interface
var rl = readline.createInterface({input: process.stdin, output: process.stdout});

var db = new loki("db.json");
// Load existing database
db.loadDatabase({}, function() {
  // Get music collection
  var music = db.getCollection("music");

  // Query song (partial match and case insensitive)
  rl.question("Partial search for song title: ", function(ans) {
    ans = ans.trim();
    rl.pause();
    var songs = music.find({title: {$regex: new RegExp(ans, "ig")}});
    // Close if no matches found
    if (songs.length === 0) {
      rl.close();
      return console.log("No matches found. Cancelled.");
    }
    for (var i = 0; i < songs.length; i++) {
      console.log("[" + i + "]", songs[i].artist.blue, "-", songs[i].title.blue);
    }
    // Confirm song
    rl.resume();
    rl.question("Confirm song index (or c to cancel): ", function(ans) {
      ans = ans.trim();
      rl.close();
      if (ans === "c") {
        return console.log("Cancelled.");
      }
      ans = Number(ans);
      if (isNaN(ans) || ans < 0 || ans >= songs.length) {
        return console.log("Invalid index. Cancelled.");
      } else {
        // Search for similar songs
        console.log("Searching similar songs...");
        findSongs(songs[ans], music);
      }
    });
  });
});
