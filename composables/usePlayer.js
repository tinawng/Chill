import albums from "~/assets/data/albums.json"
import YouTubePlayer from "youtube-player"

const album = ref(undefined)
const is_player_ready = ref(false)
let player = undefined
const player_state = ref(-1)
const player_current_time = ref(1)
const is_player_muted = ref(false)
const current_track = ref({})
album.value = getRandomAlbum("album")

function getRandomAlbum(type) {
  let random_album
  do {
    random_album = albums[Math.floor(Math.random() * albums.length)]
  } while (random_album.youtube_id === album.value?.youtube_id || random_album.type !== type)

  return random_album
}

export function usePlayer() {
  function initPlayer() {
    selectAlbum(album.value)
  }

  function onPlayerReady(event) {
    is_player_ready.value = true
    current_track.value = findTrack(player_current_time.value)
    setInterval(async () => {
      player_current_time.value = parseInt(await player.getCurrentTime())
    }, 3000)

    event.target.playVideo() // autoplay
    player.unMute() // prevent default mute
    player.setVolume(80)
  }

  function onPlayerStateChange(event) {
    player_state.value = event.data // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering, 5: video cued
    if (player_state.value == 0) {
      selectAlbum(getRandomAlbum(album.value.type))
    }
  }

  function play() {
    player.playVideo()
  }
  function pause() {
    player.pauseVideo()
  }
  function playPause() {
    if (player_state.value == 1) player.pauseVideo()
    else player.playVideo()
  }

  function nextTrack() {
    if (current_track.value.index == album.value.tracks.length - 1) return
    var next_track = album.value.tracks[current_track.value.index + 1]
    current_track.value = next_track
    player.seekTo(next_track.time_stamp)
  }
  function previousTrack() {
    if (current_track.value.index == 0) return
    var next_track = album.value.tracks[current_track.value.index + -1]
    current_track.value = next_track
    player.seekTo(next_track.time_stamp)
  }

  function setVolume(event) {
    if (typeof event == "object" && this.is_mouse_down) {
      const maxWidth = 112 // "volume-bar-clickable-container" width
      var volume = Math.max(0, Math.min((event.offsetX / maxWidth) * 100, 100))
    } else {
      var volume = event
    }

    this.$refs["controls-container"].$refs["volume-bar-set"].style.width = volume + "%"
    player.setVolume(volume)
    if (is_player_muted.value) this.mute()
  }
  function mute() {
    if (is_player_muted.value) {
      player.unMute()
      is_player_muted.value = false
    } else {
      player.mute()
      is_player_muted.value = true
    }
  }

  function selectTrack(track) {
    current_track.value = track
    player.seekTo(track.time_stamp)
    play()
  }
  function selectAlbum(_album) {
    if (_album && player) {
      album.value = _album
      player.destroy()
    }

    player = YouTubePlayer("player", {
      height: "1" /* 📱 No null dimensions to prevent mobile sleeping*/,
      width: "1",
      videoId: _album.youtube_id,
    })

    player.on("stateChange", onPlayerStateChange)
    player.on("ready", onPlayerReady)
  }

  function findTrack(time) {
    for (let i = 0; i < album.value.tracks.length; i++) {
      let track = album.value.tracks[i]

      if (i == album.value.tracks.length - 1) return track

      let next_track = album.value.tracks[i + 1]
      if (time >= track.time_stamp && time < next_track.time_stamp) return track
    }
  }

  function seekTo(time) {
    player.seekTo(time)
  }

  return {
    albums,
    album,
    current_track,
    player_state,
    is_player_ready,
    is_player_muted,
    initPlayer,
    playPause,
    previousTrack,
    nextTrack,
    mute,
    setVolume,
    selectTrack,
    selectAlbum,
    seekTo
  }
}
