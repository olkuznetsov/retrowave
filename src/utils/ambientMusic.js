/**
 * RetroWave Ambient Music Generator
 * Procedural FFX / PS2-era ambient sound via Web Audio API
 * No audio file needed — plays forever in the browser
 */

let ctx = null;
let masterGain = null;
let nodes = [];
let arpInterval = null;
let isPlaying = false;

// A minor pentatonic scale (FFX-like: spacious, melancholic, floating)
const NOTES = [
  // Octave 3
  220.00, 261.63, 293.66, 329.63, 392.00,
  // Octave 4
  440.00, 523.25, 587.33, 659.25, 784.00,
];

const PAD_FREQS = [110.00, 130.81, 146.83, 164.81]; // deep bass pad (A2 minor chord)

function createReverb(ctx) {
  const convolver = ctx.createConvolver();
  const length = ctx.sampleRate * 3.5;
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const buf = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      buf[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.2);
    }
  }
  convolver.buffer = impulse;
  return convolver;
}

function createPadOscillator(freq, detune = 0, gain = 0.035) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = freq;
  osc.detune.value = detune;

  // Slow LFO for gentle tremolo / chorus feel
  lfo.type = 'sine';
  lfo.frequency.value = 0.15 + Math.random() * 0.1;
  lfoGain.gain.value = 3 + Math.random() * 2;

  lfo.connect(lfoGain);
  lfoGain.connect(osc.detune);

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + 4);

  osc.connect(gainNode);
  lfo.start();
  osc.start();

  return { osc, gainNode, lfo, lfoGain };
}

function playArpNote(freq) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.value = freq;

  filter.type = 'lowpass';
  filter.frequency.value = 1800;
  filter.Q.value = 1.2;

  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.06, now + 0.08);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(masterGain);

  osc.start(now);
  osc.stop(now + 3);
}

// Slow melodic arpeggio pattern (FFX-like ascending/descending)
const ARP_PATTERNS = [
  [0, 2, 4, 7, 9],   // ascending pentatonic
  [9, 7, 4, 2, 0],   // descending
  [0, 4, 7, 4, 2],   // V shape
  [0, 2, 7, 9, 7],   // skip pattern
];
let patternIdx = 0;
let noteIdx = 0;

function tickArp() {
  const pattern = ARP_PATTERNS[patternIdx];
  const noteFreq = NOTES[pattern[noteIdx]];
  playArpNote(noteFreq);

  noteIdx = (noteIdx + 1) % pattern.length;
  if (noteIdx === 0) {
    patternIdx = (patternIdx + 1) % ARP_PATTERNS.length;
  }
}

export function startAmbient() {
  if (isPlaying) return;
  isPlaying = true;

  ctx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 3);

  const reverb = createReverb(ctx);
  const reverbGain = ctx.createGain();
  reverbGain.gain.value = 0.55;

  const dryGain = ctx.createGain();
  dryGain.gain.value = 0.45;

  // Stereo panner for width
  const panner = ctx.createStereoPanner();
  panner.pan.value = 0;

  masterGain.connect(dryGain);
  masterGain.connect(reverb);
  reverb.connect(reverbGain);
  dryGain.connect(ctx.destination);
  reverbGain.connect(ctx.destination);

  // Deep drone pad — 4 detuned oscillators per note for thick chorus
  PAD_FREQS.forEach((freq, i) => {
    [-8, 0, 8].forEach((detune, j) => {
      const vol = i === 0 ? 0.04 : 0.025;
      const pad = createPadOscillator(freq, detune, vol * (j === 1 ? 1.2 : 0.8));
      pad.gainNode.connect(masterGain);
      nodes.push(pad);
    });
  });

  // Sub-bass sine drone
  const bass = createPadOscillator(55, 0, 0.04);  // A1
  bass.gainNode.connect(masterGain);
  nodes.push(bass);

  // High shimmer layer
  const shimmer = createPadOscillator(880, 0, 0.012);
  shimmer.gainNode.connect(masterGain);
  nodes.push(shimmer);

  // Start arpeggio — slow, dreamlike (every 2.4s)
  noteIdx = 0;
  patternIdx = 0;
  tickArp();
  arpInterval = setInterval(tickArp, 2400);
}

export function stopAmbient() {
  if (!isPlaying) return;
  isPlaying = false;

  if (masterGain) {
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.5);
  }

  clearInterval(arpInterval);

  setTimeout(() => {
    nodes.forEach(({ osc, lfo }) => {
      try { osc.stop(); } catch (_) {}
      try { lfo.stop(); } catch (_) {}
    });
    nodes = [];
    if (ctx) {
      ctx.close();
      ctx = null;
    }
  }, 3000);
}

export function setAmbientVolume(vol) {
  if (masterGain && ctx) {
    masterGain.gain.linearRampToValueAtTime(vol * 0.7, ctx.currentTime + 0.5);
  }
}

export function isAmbientPlaying() {
  return isPlaying;
}
