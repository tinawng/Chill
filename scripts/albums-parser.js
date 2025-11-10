import { getPaletteFromURL } from 'color-thief-node';
import raw_albums from "~/assets/data/albums.json";

const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
}).join('');
function regexLastIndexOf(string, regex, startpos) {
    regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
    if (typeof (startpos) == "undefined") {
        startpos = string.length;
    } else if (startpos < 0) {
        startpos = 0;
    }
    var stringToWorkWith = string.substring(0, startpos + 1);
    var lastIndexOf = -1;
    var nextStop = 0;
    let result;
    while ((result = regex.exec(stringToWorkWith)) != null) {
        lastIndexOf = result.index;
        regex.lastIndex = ++nextStop;
    }
    return lastIndexOf;
}
function extractTracklist(description) {
    let first_slice = description.search(/([0-9]:[0-9])\w/);
    description = description.slice(first_slice - 1);
    let last_slice = description.search(/(\n\n)+/);
    return description.slice(0, last_slice);
}
function youtubeTimeToSeconds(time) {
    // youtube time format example: "PT1H13M37S" or "PT2H35S"
    time = time.replace('PT', '');

    let hr = 0, min = 0, sec = 0;

    if (time.search('H') != -1) {
        [hr, time] = time.split('H');
    }
    if (time.search('M') != -1) {
        [min, time] = time.split('M');
    }
    [sec, time] = time.split('S');

    return 3600 * parseInt(hr) + 60 * parseInt(min) + parseInt(sec);
}

class Album {
    constructor(raw_album) {
        this.type = raw_album.type;
        this.genre = raw_album.genre;
        this.name = raw_album.name;
        this.youtube_id = raw_album.youtube_id;
        this.cover = raw_album.cover;
        this.duration = youtubeTimeToSeconds(raw_album.duration);
        this.tracks = [];
        this.color_pallete = raw_album.color_pallete;

        if (raw_album.tracklist) {
            // Remove consecutive white space and []
            raw_album.tracklist = raw_album.tracklist.replaceAll('[', '');
            raw_album.tracklist = raw_album.tracklist.replaceAll(']', '');

            while (raw_album.tracklist.includes(':')) {

                if (raw_album.tracklist.search(/([0-9]:[0-9][0-9]:[0-9])\w/) != -1) {
                    // Time stamps format is hh:mm:ss
                    var time_stamp_format = "long";
                    var regex = /([0-9]:[0-9][0-9]:[0-9])\w/
                }
                else {
                    // Time stamps format is mm:ss
                    var time_stamp_format = "short";
                    var regex = /([0-9]:[0-9])\w/
                }

                let raw_track;

                // Check if this is the last track
                if ((time_stamp_format == "long" && (raw_album.tracklist.match(/:/g) || []).length == 2) || (time_stamp_format == "short" && (raw_album.tracklist.match(/:/g) || []).length == 1)) {
                    raw_track = raw_album.tracklist;
                    raw_album.tracklist = ""
                }
                else
                    raw_track = raw_album.tracklist.slice(regexLastIndexOf(raw_album.tracklist, regex) - 1);

                // Remove current raw_track for list
                raw_album.tracklist = raw_album.tracklist.replace(raw_track, '');

                // Clean white spaces
                raw_track = raw_track.replace(/\s+/g, ' ').trim();

                let track = {};
                if (time_stamp_format == "long") {
                    var [hr, min, sec] = raw_track.split(' ')[0].split(':');
                    var time_code_length = 9;
                }
                else {
                    var hr = 0;
                    var [min, sec] = raw_track.split(' ')[0].split(':');
                    var time_code_length = 6;
                }

                track.time_stamp = parseInt(hr) * 3600 + parseInt(min) * 60 + parseInt(sec);
                [track.artist, track.title] = raw_track.slice(time_code_length).replace(/\s+/g, ' ').trim().split(' - ');

                this.tracks.push(track);
            }

            // Reverse track order & set index
            this.tracks = this.tracks.reverse();
            for (let i = 0; i < this.tracks.length; i++)
                this.tracks[i].index = i;

            // Calcul tracks duration
            for (let i = 0; i < this.tracks.length; i++) {
                if (i == this.tracks.length - 1)
                    this.tracks[i].duration = this.duration - this.tracks[i].time_stamp;
                else
                    this.tracks[i].duration = this.tracks[i + 1].time_stamp - this.tracks[i].time_stamp
            }
        }
        else if (raw_album.type == "mixtape") {
            this.tracks = [{ index: 0, title: raw_album.name, artist: raw_album.artist, time_stamp: 0, duration: this.duration }];
        }
    }
}

export default async (context, inject) => {
    var albums = [];
    for (let raw_album of raw_albums) {

        let youtube_data = await (await fetch("https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=" + raw_album.youtube_id + "&key=" + process.env.YOUTUBE_API_KEY)).json();
        let description = youtube_data['items'][0]['snippet']['description'];
        raw_album.duration = youtube_data['items'][0]['contentDetails']['duration'];

        // chillhop channel id: UCOxqgCwgOqC2lMqC5PYz_Dg
        // chilledcow channel id: UCSJ4gkVC6NrvII8umztf0Ow
        if (["UCOxqgCwgOqC2lMqC5PYz_Dg", "UCSJ4gkVC6NrvII8umztf0Ow"].includes(youtube_data['items'][0]['snippet']['channelId']))
            raw_album.tracklist = extractTracklist(description);

        raw_album.cover = raw_album.cover ? raw_album.cover : "https://img.youtube.com/vi/" + raw_album.youtube_id + "/maxresdefault.jpg";

        let color_pallete = await getPaletteFromURL(raw_album.cover);
        raw_album.color_pallete = color_pallete.map(rgb => rgbToHex(...rgb));

        albums.push(new Album(raw_album));
    }

    inject('albums', albums);
}