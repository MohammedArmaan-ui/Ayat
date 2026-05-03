import { Audio } from 'expo-av';
import { SURAH_DATA } from '../constants/surahData';

class AudioService {
  private sound: Audio.Sound | null = null;
  private isPlaying: boolean = false;
  private isLooping: boolean = false;
  private onFinishedListener: (() => void) | null = null;

  async playAyah(surahId: number, ayahNumber: number, speaker: string = 'ar.alafasy') {
    if (this.sound) {
      await this.sound.unloadAsync();
    }

    const globalAyah = this.getGlobalAyahNumber(surahId, ayahNumber);
    const url = `https://cdn.islamic.network/quran/audio/128/${speaker}/${globalAyah}.mp3`;
    
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, isLooping: this.isLooping },
        this.handlePlaybackStatusUpdate.bind(this)
      );
      this.sound = sound;
      this.isPlaying = true;
    } catch (e) {
      console.error('Playback error:', e);
    }
  }

  async playUrl(url: string) {
    if (this.sound) {
      await this.sound.unloadAsync();
    }

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, isLooping: this.isLooping },
        this.handlePlaybackStatusUpdate.bind(this)
      );
      this.sound = sound;
      this.isPlaying = true;
    } catch (e) {
      console.error('URL Playback error:', e);
    }
  }

  private handlePlaybackStatusUpdate(status: any) {
    if (status.didJustFinish && !status.isLooping) {
      this.isPlaying = false;
      if (this.onFinishedListener) {
        this.onFinishedListener();
      }
    }
  }

  setOnFinishedListener(listener: (() => void) | null) {
    this.onFinishedListener = listener;
  }

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

  private getGlobalAyahNumber(surahId: number, ayahNumber: number): number {
    let count = 0;
    for (let i = 0; i < surahId - 1; i++) {
      count += SURAH_DATA[i].ayah_count;
    }
    return count + ayahNumber;
  }
}

export const audioService = new AudioService();
