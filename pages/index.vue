<template>
  <div
    ref="page-container"
    class="page-container"
    :style="color_pallete_css_var + 'background: var(--color_pallete)'"
    @mouseleave="show_expansion_panel = false"
  >
    <div
      v-if="is_mobile"
      class="absolute top-0 h-1/5 w-full z-10"
      style="
        background: linear-gradient(0, #ffffff00 10%, var(--color_pallete) 95%);
      "
    ></div>
    <div
      v-if="is_player_ready"
      class="navigation-container"
      :style="
        navigation_container_css_vars +
        [
          is_mobile
            ? 'background: linear-gradient(180deg, #ffffff00 10%, var(--color_pallete) 40%);'
            : '',
        ]
      "
    >
      <Showcase ref="showcase-container" />
      <Controls ref="controls-container" />

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
import Controls from "../components/Controls.vue";
export default {
  components: { Controls },
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
    is_mobile: false,
    is_mouse_down: false,
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
  }),
  computed: {
    navigation_container_css_vars: function () {
      var css_vars = "--control_container_hover_height: ";
      css_vars += this.show_expansion_panel ? "100%;" : "18rem;";
      css_vars += "--navigation_container_transition_duration: ";
      css_vars += this.show_expansion_panel ? "0.6s;" : "0.4s;";
      return css_vars;
    },
    color_pallete_css_var: function () {
      return "--color_pallete: " + this.album.color_pallete[0] + ";";
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
    this.isMobile();
    window.addEventListener("resize", this.isMobile.bind(this));
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
          } else if (event.code.startsWith("Digit")) {
            let digit = parseInt(event.code.slice(event.code.length - 1));
            this.player.seekTo(this.album.duration * (digit / 10));
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

    this.selectAlbum();

    console.log(
      "🚨 ~~ All the following errors are caused by youtube-embed iframe javascript bull💩 ~~ 🚨"
    );
  },
  methods: {
    isMobile() {
      this.is_mobile = !window.matchMedia("(min-width: 768px)").matches;
    },

    onPlayerReady(event) {
      this.is_player_ready = true;

      this.current_track = this.findTrack(this.player_current_time);
      setInterval(async () => {
        this.player_current_time = parseInt(await this.player.getCurrentTime());
      }, 3000);

      event.target.playVideo(); // autoplay
      this.player.unMute(); // prevent default mute
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
        const maxWidth = this.$refs["controls-container"].$refs[
          "volume-bar-clickable-container"
        ].clientWidth;
        var volume = Math.max(
          0,
          Math.min((event.offsetX / maxWidth) * 100, 100)
        );
      } else {
        var volume = event;
      }

      this.$refs["controls-container"].$refs["volume-bar-set"].style.width =
        volume + "%";
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
  @apply absolute bottom-0 left-0 z-10 h-1/2 w-full;

  @media (min-width: 768px) {
    @apply h-56 p-8;
    @apply flex flex-col;

    transition-property: height;
    transition-duration: var(--navigation_container_transition_duration);
  }
}
.page-container:hover .navigation-container {
  @media (min-width: 768px) {
    height: var(--control_container_hover_height);
  }
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
  @apply grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8;
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
  @apply absolute top-0 left-0;
  @apply bg-cover bg-center;
  @apply h-3/4 w-full;

  @media (min-width: 768px) {
    @apply h-screen w-full;
    filter: blur(12px) grayscale(0.1) brightness(0.8);
    -webkit-filter: blur(12px) grayscale(0.1) brightness(0.8);
  }
}
</style>