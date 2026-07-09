class SoundPlayer {
  constructor() {
    this.sounds = {};
    if (typeof window !== "undefined") {
      this.initSounds();
    }
  }

  initSounds() {
    // Expecting these files to be added by the user in public/sounds/
    const soundFiles = {
      click: "/sounds/click.mp3",
      correct: "/sounds/correct.mp3",
      wrong: "/sounds/wrong.mp3",
      tick: "/sounds/tick.mp3",
      intermission: "/sounds/intermission.mp3",
      start: "/sounds/start.mp3",
      whip: "/sounds/whip.mp3"
    };

    for (const [key, path] of Object.entries(soundFiles)) {
      const audio = new Audio(path);
      audio.preload = "auto";
      this.sounds[key] = audio;
    }
  }

  play(soundName, loop = false) {
    if (typeof window === "undefined" || !this.sounds[soundName]) return null;
    
    const soundInstance = this.sounds[soundName].cloneNode();
    soundInstance.volume = 0.7;
    soundInstance.loop = loop;
    
    soundInstance.play().catch(err => {
      console.warn(`Could not play sound: ${soundName}. User interaction might be required first.`, err);
    });

    return soundInstance;
  }
}

const soundPlayer = new SoundPlayer();
export default soundPlayer;
