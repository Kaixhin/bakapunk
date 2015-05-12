Baka Punk
=========

A tool for finding similar songs in your music library. Similarity is based on BPM and key.
This is primarily a tool for DJs and requires:

- A MP3 music collection. 
- A structure of artist/album/songs.
- BPM and key tags.
- Keys tagged according to the Mixed In Key [Camelot Wheel](http://www.mixedinkey.com/Book/How-to-Use-Harmonic-Mixing-2).
- [Musly]()

Setup
-----

Install Node.js and npm. Clone this repo and run `npm install` inside to download the dependencies.
Install Musly and run `musly -N` in this directory to initialise `collection.musly`.

Create a file called `music_dir.txt` which contains the path to your music library e.g. /Users/BakaPunk/Music.
Run `node process.js` to scan your music and save it into `db.json` and `collection.musly`. This can take a while to complete.
Files are identified by their path e.g. Baka Punk/Mashups/diSONICted.mp3.
The processing ignores files which have already been added, so can be run to add new music (but will also add files whose paths have changed).
The processing does not remove deleted files.
To clear the databases simply delete `db.json` and `collection.musly`.

Usage
-----

Run `node .`. You will be prompted to enter part of a title to search (case-insensitive).
If there are any matches you will be prompted to enter the index corresponding to the correct song.
The "best" (max 50) matches will then be returned.

Todo
----

- Page up and down of all results
- Search weighted on needing to go up or down in BPM
