import { Audio } from 'expo-av';

class AudioService {
  private sound: Audio.Sound | null = null;
  private isPlaying: boolean = false;

  async playAyah(surahId: number, ayahNumber: number) {
    if (this.sound) {
      await this.sound.unloadAsync();
    }

    // Mock URL for Al-Fatiha 1 from Alafasy
    // Real app would fetch from an API or local storage
    const url = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${this.getGlobalAyahNumber(surahId, ayahNumber)}.mp3`;
    
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, isLooping: this.isLooping }
      );
      this.sound = sound;
      this.isPlaying = true;
    } catch (e) {
      console.error('Playback error:', e);
    }
  }

  private isLooping: boolean = false;

  setLooping(loop: boolean) {
    this.isLooping = loop;
    if (this.sound) {
      this.sound.setIsLoopingAsync(loop);
    }
  }

  async pause() {
    if (this.sound) {
      await this.sound.pauseAsync();
      this.isPlaying = false;
    }
  }

  async resume() {
    if (this.sound) {
      await this.sound.playAsync();
      this.isPlaying = true;
    }
  }

  async stop() {
    if (this.sound) {
      await this.sound.stopAsync();
      this.isPlaying = false;
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  private getGlobalAyahNumber(surahId: number, ayahNumber: number) {
    // Very simplified global ayah number for mock
    // In a real app, this would be looked up from a table
    if (surahId === 1) return ayahNumber;
    return 7 + ayahNumber; // Assuming Surah 2 starts after 7 ayahs of Surah 1
  }
}

export const audioService = new AudioService();
