<template>
  <div class="controls-container">
    <svg
      v-if="$parent.player_state != 1"
      style="padding-left: 0.75rem"
      @click="$parent.playPause()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
    <svg
      v-else
      @click="$parent.playPause()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
    >
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    </svg>
    <svg
      :class="{ 'opacity-30': $parent.current_track.index == 0 }"
      @click="$parent.previousTrack()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <polygon points="19 20 9 12 19 4 19 20"></polygon>
      <line x1="5" y1="19" x2="5" y2="5"></line>
    </svg>
    <svg
      @click="$parent.nextTrack()"
      :class="{
        'opacity-30': $parent.current_track.index == $parent.album.tracks.length - 1,
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
      v-if="$parent.is_player_muted"
      @click="$parent.mute()"
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
      @click="$parent.mute()"
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
      <div class="volume-bar-container" @mousemove="$parent.setVolume">
        <div ref="volume-bar-set" class="volume-bar-set" />
      </div>
    </div>

    <span>{{ $parent.current_track.index + 1 }} / {{ $parent.album.tracks.length }}</span>

    <svg
      @click="$parent.openExpansionPanel('playlist')"
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
</template>

<script>
export default {};
</script>

<style lang="postcss">
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
</style>