<template>
  <div
    ref="page-container"
    class="page-container"
    :style="'background: ' + album.color_pallete[0]"
    @mouseleave="show_expansion_panel = false"
  >
    <div
      v-if="is_player_ready"
      class="navigation-container"
      :style="navigation_container_css_vars"
    >
      <div class="showcase-container">
        <img :src="album.cover" alt="cover" />
        <div>
          <h1>{{ current_track.title }}</h1>
          <h2>
            {{ current_track.artist
            }}<span v-show="album.type != 'mixtape'"> • {{ album.name }}</span>
          </h2>
        </div>
        <div class="extra-controls" @click="openExpansionPanel('albums')">
          <h4>more albums</h4>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </div>
        <svg
          v-if="player_state == 3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path
            d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
          ></path>
        </svg>
      </div>
      <div class="controls-container">
        <svg
          v-if="player_state != 1"
          style="padding-left: 0.75rem"
          @click="playPause()"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <svg
          v-else
          @click="playPause()"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
        <svg
          :class="{ 'opacity-30': current_track.index == 0 }"
          @click="previousTrack()"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polygon points="19 20 9 12 19 4 19 20"></polygon>
          <line x1="5" y1="19" x2="5" y2="5"></line>
        </svg>
        <svg
          @click="nextTrack()"
          :class="{
            'opacity-30': current_track.index == album.tracks.length - 1,
          }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polygon points="5 4 15 12 5 20 5 4"></polygon>
          <line x1="19" y1="5" x2="19" y2="19"></line>
        </svg>
        <svg
          v-if="is_player_muted"
          @click="mute()"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
        <svg
          v-else
          @click="mute()"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path
            d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
          ></path>
        </svg>

        <div
          ref="volume-bar-clickable-container"
          class="volume-bar-clickable-container"
        >
          <div class="volume-bar-container" @mousemove="setVolume">
            <div ref="volume-bar-set" class="volume-bar-set" />
          </div>
        </div>

        <span>{{ current_track.index + 1 }} / {{ album.tracks.length }}</span>

        <svg
          @click="openExpansionPanel('playlist')"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </div>
      <transition name="fade">
        <div v-if="show_expansion_panel" class="expansion-panel-container">
          <div v-if="expansion == 'playlist'" class="playlist-container">
            <div
              v-for="track in album.tracks"
              :key="track.index"
              class="row"
              :class="{ current: track == current_track }"
              @click="selectTrack(track)"
            >
              <h3>{{ track.title }}</h3>
              <h3>{{ track.artist }}</h3>
              <h3>{{ album.name }}</h3>
              <h3>{{ formatTrackDuration(track.duration) }}</h3>
            </div>
          </div>
          <div v-if="expansion == 'albums'" class="albums-container">
            <div
              v-for="album in albums"
              :key="album.name"
              class="row"
              @click="selectAlbum(album)"
            >
              <div
                class="cover"
                :style="'background-image: url(' + album.cover + ')'"
              />
              <div class="description">
                <h1>{{ album.name }}</h1>
                <h2>
                  {{ album.tracks.length }} tracks •
                  {{ formatAlbumDuration(album.duration) }}
                </h2>
              </div>
              <div
                class="background"
                :style="'background-image: url(' + album.cover + ')'"
              ></div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <div
      class="background-cover"
      :style="'background-image: url(' + album.cover + ')'"
    ></div>
    <div id="player"></div>
  </div>
</template>

<script>
import YouTubePlayer from "youtube-player";
export default {
  async asyncData({ $albums }) {
    var albums = $albums;
    return { albums };
  },

  head() {
    return {
      meta: [
        {
          hid: "theme-color",
          name: "theme-color",
          content: this.album.color_pallete[0],
        },
      ],
    };
  },

  data: () => ({
    album: undefined,
    albums_typelist: [],
    is_player_ready: false,
    player: undefined,
    player_state: -1,
    player_current_time: 1,
    is_player_muted: false,
    current_track: undefined,
    show_expansion_panel: false,
    expansion: undefined,
    is_mouse_down: false,
  }),
  computed: {
    navigation_container_css_vars: function () {
      var css_vars = "--control_container_hover_height: ";
      css_vars += this.show_expansion_panel ? "100%" : "18rem";
      css_vars += ";--navigation_container_transition_duration: ";
      css_vars += this.show_expansion_panel ? "0.6s" : "0.4s";
      return css_vars;
    },
  },
  watch: {
    player_current_time: function (time) {
      this.current_track = this.findTrack(time);
    },
  },

  created() {
    this.albums_typelist = [...new Set(this.albums.map((album) => album.type))];
    this.album = this.getRandomAlbum("album");
  },
  mounted() {
    this.selectAlbum();

    window.addEventListener(
      "keyup",
      async function (event) {
        if (this.is_player_ready)
          if (event.code === "Space") {
            this.playPause();
          } else if (event.code === "ArrowLeft") {
            this.previousTrack();
          } else if (event.code === "ArrowRight") {
            this.nextTrack();
          } else if (event.code === "ArrowUp") {
            let volume = await this.player.getVolume();
            volume = Math.min(volume + 10, 100);
            this.setVolume(volume);
          } else if (event.code === "ArrowDown") {
            let volume = await this.player.getVolume();
            volume = Math.max(volume - 10, 0);
            this.setVolume(volume);
          }
      }.bind(this)
    );
    window.addEventListener(
      "mousedown",
      (() => {
        this.is_mouse_down = true;
      }).bind(this)
    );
    window.addEventListener(
      "mouseup",
      (() => {
        this.is_mouse_down = false;
      }).bind(this)
    );

    console.log(
      "🚨 ~~ All the following errors are caused by youtube-embed iframe javascript bull💩 ~~ 🚨"
    );
  },
  methods: {
    onPlayerReady(event) {
      this.is_player_ready = true;

      this.current_track = this.findTrack(this.player_current_time);
      setInterval(async () => {
        this.player_current_time = parseInt(await this.player.getCurrentTime());
      }, 3000);

      event.target.playVideo(); // autoplay
      this.player.setVolume(80);
    },
    onPlayerStateChange(event) {
      this.player_state = event.data; // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering, 5: video cued
      if (this.player_state == 0) {
        this.selectAlbum(this.getRandomAlbum(this.album.type));
      }
    },

    play() {
      this.player.playVideo();
    },
    pause() {
      this.player.pauseVideo();
    },
    playPause() {
      if (this.player_state == 1) this.player.pauseVideo();
      else this.player.playVideo();
    },

    nextTrack() {
      if (this.current_track.index == this.album.tracks.length - 1) return;
      var next_track = this.album.tracks[this.current_track.index + 1];
      this.current_track = next_track;
      this.player.seekTo(next_track.time_stamp);
    },
    previousTrack() {
      if (this.current_track.index == 0) return;
      var next_track = this.album.tracks[this.current_track.index + -1];
      this.current_track = next_track;
      this.player.seekTo(next_track.time_stamp);
    },

    setVolume(event) {
      if (typeof event == "object" && this.is_mouse_down) {
        const maxWidth = this.$refs["volume-bar-clickable-container"]
          .clientWidth;
        var volume = Math.max(
          0,
          Math.min((event.offsetX / maxWidth) * 100, 100)
        );
      } else {
        var volume = event;
      }

      this.$refs["volume-bar-set"].style.width = volume + "%";
      this.player.setVolume(volume);
      if (this.is_player_muted) this.mute();
    },
    mute() {
      if (this.is_player_muted) {
        this.player.unMute();
        this.is_player_muted = false;
      } else {
        this.player.mute();
        this.is_player_muted = true;
      }
    },

    selectTrack(track) {
      this.current_track = track;
      this.player.seekTo(track.time_stamp);
      this.play();
    },
    selectAlbum(album) {
      if (album) {
        this.album = album;
        this.player.destroy();
      }

      this.player = YouTubePlayer("player", {
        height: "1" /* 📱 No null dimensions to prevent mobile sleeping*/,
        width: "1",
        videoId: this.album.youtube_id,
      });
      this.player.on("stateChange", this.onPlayerStateChange);
      this.player.on("ready", this.onPlayerReady);
    },
    getRandomAlbum(type) {
      let random_album;
      do {
        random_album = this.albums[
          Math.floor(Math.random() * this.albums.length)
        ];
      } while (random_album == this.album || random_album.type != type);

      return random_album;
    },

    openExpansionPanel(expansion_name) {
      if (!this.show_expansion_panel) this.show_expansion_panel = true;
      else if (this.expansion == expansion_name && this.show_expansion_panel)
        this.show_expansion_panel = false;
      this.expansion = expansion_name;
    },

    findTrack(time) {
      for (let i = 0; i < this.album.tracks.length; i++) {
        let track = this.album.tracks[i];

        if (i == this.album.tracks.length - 1) return track;

        let next_track = this.album.tracks[i + 1];
        if (time >= track.time_stamp && time < next_track.time_stamp)
          return track;
      }
    },
    formatTrackDuration(duration) {
      duration %= 3600;
      let minutes = Math.floor(duration / 60);
      let seconds = duration % 60;

      return minutes + ":" + seconds.toString().padStart(2, "0");
    },
    formatAlbumDuration(duration) {
      let hr = Math.floor(duration / 3600);
      let min = Math.floor((duration % 3600) / 60);

      if (min < 10) min = "";
      else if (min < 25) min = 15;
      else if (min < 40) min = 30;
      else if (min < 50) min = 45;
      else {
        min = "";
        ++hr;
      }

      if (hr == 0) {
        hr = "";
        min += "min";
      } else hr += "h";

      return "" + hr + min;
    },
  },
};
</script>

<style lang="postcss">
iframe {
  /* 📱 Do not hide iframe to prevent mobile sleeping*/
  @apply absolute bottom-0 right-0 md:hidden;
}

svg {
  @apply cursor-pointer;
}

.page-container {
  @apply min-h-screen;
}

.navigation-container {
  @apply absolute bottom-0 left-0 z-10;
  @apply h-56 w-full p-8;
  @apply flex flex-col;

  transition-property: height;
  transition-duration: var(--navigation_container_transition_duration);
}
.page-container:hover .navigation-container {
  height: var(--control_container_hover_height);
}

.showcase-container {
  @apply h-28 flex;
}
.showcase-container * {
  @apply my-auto;
}
.showcase-container img {
  @apply h-full;
}
.showcase-container div {
  @apply ml-4;
}
.showcase-container .extra-controls svg {
  @apply h-8 w-8 ml-4;
}
.showcase-container > svg {
  @apply h-10 w-10 ml-8;
  @apply opacity-60;

  animation-name: spin;
  animation-duration: 1.41s;
  animation-iteration-count: infinite;
}
.showcase-container :nth-child(3n) {
  @apply ml-auto;
}
.extra-controls {
  @apply pl-4 py-1 opacity-0 rounded-full;
  @apply flex items-center;
  @apply cursor-pointer;
  transition: opacity 0.2s;
}
.extra-controls:hover {
  background: #00000033;
}
.extra-controls:active {
  background: #00000066;
}
.page-container:hover .extra-controls {
  @apply opacity-70;
}

.controls-container {
  @apply mt-6 flex items-center;
  @apply opacity-0;

  transition: opacity 0.2s;
}
.page-container:hover .controls-container {
  @apply opacity-100;
}
.controls-container svg {
  @apply h-10 w-10 p-2 rounded-full;
  transition: background 0.2s;
}
.controls-container svg:hover {
  background: #00000033;
}
.controls-container svg:active {
  background: #00000066;
}
.controls-container svg:first-of-type {
  @apply h-12 w-12 -ml-2 mr-4;
}
.controls-container svg:nth-of-type(4n) {
  @apply ml-4 mr-2;
}
.controls-container :nth-child(6n) {
  @apply ml-auto;
}
.controls-container svg:last-of-type {
  @apply ml-2 -mr-1;
}
.controls-container .volume-bar-clickable-container {
  @apply w-28 py-2;
  @apply cursor-pointer;
}
.controls-container .volume-bar-container {
  @apply relative;
  @apply h-1.5 w-28;

  background: #ffffff22;
}
.controls-container .volume-bar-set {
  @apply absolute left-0;
  @apply h-full w-4/5;
  @apply cursor-pointer;

  background: #ffffff66;
}

.expansion-panel-container {
  @apply h-full mt-4 overflow-y-auto;
}

.playlist-container .row {
  @apply h-16 px-8;
  @apply border-b;
  border-color: #ffffff22;
  @apply flex items-center;
}
.playlist-container .row:hover {
  @apply border-transparent;
  background: #ffffff22;
}
.playlist-container .row:active {
  @apply border-transparent;
  background: #ffffff55;
}
.playlist-container .row.current {
  @apply border-transparent;
  background: #ffffff22;
}
.playlist-container .row:hover.current {
  background: #ffffff55;
}
.playlist-container .row:active.current {
  background: #ffffff66;
}
.playlist-container .row h3 {
  @apply opacity-70;
}
.playlist-container .row h3:first-of-type {
  @apply opacity-100 w-1/2;
}
.playlist-container .row h3:nth-of-type(2n) {
  @apply w-1/3;
}
.playlist-container .row h3:nth-of-type(3n) {
  @apply w-1/4;
}
.playlist-container .row h3:last-of-type {
  @apply w-auto ml-8 text-right;
}

.albums-container {
  @apply grid grid-cols-2 gap-8;
}
.albums-container .row {
  @apply relative;
  @apply w-full rounded-xl;
  @apply flex items-center overflow-hidden;
  @apply cursor-pointer;
}
.albums-container .row * {
  @apply z-10;
}
.albums-container .row:nth-of-type(2n) {
  @apply ml-auto flex-row-reverse;
}
.albums-container .row .description {
  @apply mx-8 flex flex-col;
}
.albums-container .row:nth-of-type(2n) .description {
  @apply text-right;
}
.albums-container .row .cover {
  @apply h-36 w-36;
  @apply bg-cover bg-center;
}
.albums-container .row .background {
  @apply absolute h-full w-full z-0;
  @apply bg-cover overflow-hidden;
  background-position: center 75%;

  filter: blur(1px) brightness(0.6);
  -webkit-filter: blur(1px) brightness(0.6);

  transition-property: transform, filter;
  transition-duration: 0.4s;
}
.albums-container .row:hover .background {
  transform: scale(1.15);
  filter: blur(0px) brightness(0.7);
  -webkit-filter: blur(0px) brightness(0.7);
}

.background-cover {
  @apply h-screen w-full;
  @apply bg-cover bg-center;
  filter: blur(12px) grayscale(0.1) brightness(0.8);
  -webkit-filter: blur(12px) grayscale(0.1) brightness(0.8);
}
</style>