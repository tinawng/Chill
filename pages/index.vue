<script setup>
  const is_mobile = ref(false)

  const {
    albums,
    album,
    is_player_ready,
    player_state,
    initPlayer,
    selectTrack,
    selectAlbum,
    playPause,
    previousTrack,
    nextTrack,
    setVolume,
    seekTo
  } = usePlayer()

  const show_expansion_panel = ref(false)
  const expansion = ref(undefined)

  const navigation_container_css_vars = computed(() => {
    var css_vars = "--control_container_hover_height: "
    css_vars += show_expansion_panel.value ? "100%;" : "18rem;"
    css_vars += "--navigation_container_transition_duration: "
    css_vars += show_expansion_panel.value ? "0.6s;" : "0.4s;"
    return css_vars
  })

  const color_pallete_css_var = computed(() => {
    return "--color_pallete: " + album.value.color_pallete[0] + ";"
  })

  useHead({ meta: [{ hid: "theme-color", name: "theme-color", content: album.value?.color_pallete[0] }] })

  onMounted(async () => {
    isMobile()
    window.addEventListener("resize", isMobile)
    window.addEventListener("keyup", async function (event) {
      if (is_player_ready.value)
        if (event.code === "Space") {
          playPause()
        } else if (event.code === "ArrowLeft") {
          previousTrack()
        } else if (event.code === "ArrowRight") {
          nextTrack()
        } else if (event.code.startsWith("Digit")) {
          let digit = parseInt(event.code.slice(event.code.length - 1))
          seekTo(album.value.duration * (digit / 10))
        }
    })

    initPlayer()

    console.log("🚨 ~~ All the following errors are caused by youtube-embed iframe javascript bull💩 ~~ 🚨")
  })

  function isMobile() {
    is_mobile.value = !window.matchMedia("(min-width: 768px)").matches
  }

  function formatTrackDuration(duration) {
    duration %= 3600
    let minutes = Math.floor(duration / 60)
    let seconds = duration % 60

    return minutes + ":" + seconds.toString().padStart(2, "0")
  }
  function formatAlbumDuration(duration) {
    let hr = Math.floor(duration / 3600)
    let min = Math.floor((duration % 3600) / 60)

    if (min < 10) min = ""
    else if (min < 25) min = 15
    else if (min < 40) min = 30
    else if (min < 50) min = 45
    else {
      min = ""
      ++hr
    }

    if (hr == 0) {
      hr = ""
      min += "min"
    } else hr += "h"

    return "" + hr + min
  }

  function openExpansionPanel(expansion_name) {
    if (!show_expansion_panel.value) show_expansion_panel.value = true
    else if (expansion.value == expansion_name && show_expansion_panel.value) this.show_expansion_panel = false
    expansion.value = expansion_name
  }
</script>

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
      style="background: linear-gradient(0, #ffffff00 10%, var(--color_pallete) 95%)"
    ></div>
    <div
      v-if="!!player_state"
      class="navigation-container"
      :style="
        navigation_container_css_vars +
        [is_mobile ? 'background: linear-gradient(180deg, #ffffff00 10%, var(--color_pallete) 40%);' : '']
      "
    >
      <Showcase :callback="openExpansionPanel" :is_mobile="is_mobile" />
      <Controls :callback="openExpansionPanel" :is_mobile="is_mobile" />

      <Transition name="fade">
        <div v-if="show_expansion_panel" class="expansion-panel-container">
          <div v-if="is_mobile" class="close-button" @click="show_expansion_panel = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
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
              <h3 v-if="!is_mobile">{{ album.name }}</h3>
              <h3>{{ formatTrackDuration(track.duration) }}</h3>
            </div>
          </div>
          <div v-if="expansion == 'albums'" class="albums-container">
            <div v-for="album in albums" :key="album.name" class="row" @click="selectAlbum(album)">
              <div class="cover" :style="'background-image: url(' + album.cover + ')'" />
              <div class="description">
                <h1>{{ album.name }}</h1>
                <h2>
                  {{ album.tracks.length }} tracks •
                  {{ formatAlbumDuration(album.duration) }}
                </h2>
              </div>
              <div class="background" :style="'background-image: url(' + album.cover + ')'"></div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <div class="background-cover" :style="'background-image: url(' + album.cover + ')'"></div>
    <div id="player"></div>
  </div>
</template>

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
    @media (max-width: 767px) {
      @apply fixed top-0;
      background: var(--color_pallete);
    }

    @apply h-full w-full mt-4 overflow-y-auto;
  }
  .expansion-panel-container .close-button {
    @apply fixed top-6 left-2;
    @apply h-8 w-8 z-20;
    @apply rounded-full;
    background: #00000066;
  }

  .playlist-container .row {
    @apply h-16 pl-6 pr-4 md:px-8;
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
    @apply w-1/3 text-center md:text-left;
  }
  .playlist-container .row h3:nth-of-type(3n) {
    @apply w-1/4;
  }
  .playlist-container .row h3:last-of-type {
    @apply w-auto ml-8 text-right;
  }

  .albums-container {
    @apply mx-4 md:mx-0 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8;
  }
  .albums-container h1 {
    @apply text-base;
  }
  .albums-container h2 {
    @apply text-sm;
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
    @apply h-28 md:h-36 w-28 md:w-36;
    @apply flex-shrink-0;
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
