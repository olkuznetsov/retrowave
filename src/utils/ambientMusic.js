/**
 * RetroWave Ambient Music — SomaFM Drone Zone stream
 * https://somafm.com/dronezone/
 */

const STREAM_URL = 'https://ice1.somafm.com/dronezone-128-mp3';
const FALLBACK_URL = 'https://ice2.somafm.com/dronezone-128-mp3';

let audio = null;
let isPlaying = false;
let currentVolume = 0.5;

export function startAmbient() {
  if (isPlaying) return;
  isPlaying = true;

  audio = new Audio();
  audio.crossOrigin = 'anonymous';
  audio.volume = currentVolume;
  audio.preload = 'none';

  audio.onerror = () => {
    // Try fallback server if primary fails
    if (audio.src !== FALLBACK_URL) {
      audio.src = FALLBACK_URL;
      audio.play().catch(() => {});
    }
  };

  audio.src = STREAM_URL;
  audio.play().catch(() => {
    // Autoplay blocked — user gesture already happened via toggle button, so this is rare
  });
}

export function stopAmbient() {
  if (!isPlaying) return;
  isPlaying = false;

  if (audio) {
    // Fade out manually
    const fadeStep = audio.volume / 20;
    const fade = setInterval(() => {
      if (audio && audio.volume > fadeStep) {
        audio.volume = Math.max(0, audio.volume - fadeStep);
      } else {
        clearInterval(fade);
        if (audio) {
          audio.pause();
          audio.src = '';
          audio = null;
        }
      }
    }, 100);
  }
}

export function setAmbientVolume(vol) {
  currentVolume = vol;
  if (audio) audio.volume = vol;
}

export function isAmbientPlaying() {
  return isPlaying;
}
