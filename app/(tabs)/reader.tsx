import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, useColorScheme, ActivityIndicator, Alert, Image } from 'react-native';
import { Stack, useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Search, Settings, ChevronDown, BookOpen } from 'lucide-react-native';

import { Text } from '@/components/Themed';
import { AyahCard } from '../../src/components/AyahCard';
import { AudioController } from '../../src/components/AudioController';
import { ReflectionModal } from '../../src/components/ReflectionModal';
import { QuranService } from '../../src/services/quranService';
import { audioService } from '../../src/services/audioService';
import { SettingsService, AppSettings } from '../../src/services/settingsService';
import { Surah, Ayah } from '../../src/models/types';
import { Colors } from '../../src/theme/colors';

export default function ReaderScreen() {
  const { surahId } = useLocalSearchParams();
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAyah, setActiveAyah] = useState<Ayah | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [reflectionVisible, setReflectionVisible] = useState(false);
  const [reflectionAyah, setReflectionAyah] = useState<Ayah | null>(null);
  const [loopingAyahId, setLoopingAyahId] = useState<number | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  
  const systemColorScheme = useColorScheme() ?? 'light';
  const theme = settings ? (Colors as any)[settings.theme] : (Colors as any)[systemColorScheme];
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    const s = await SettingsService.getSettings();
    setSettings(s);
  };

  useEffect(() => {
    loadData();
    if (surahId) {
      SettingsService.updateSetting('lastReadSurah', parseInt(surahId as string));
    }
  }, [surahId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const s = await SettingsService.getSettings();
      setSettings(s);

      const surahs = await QuranService.getSurahs();
      if (surahs.length > 0) {
        const id = surahId ? parseInt(surahId as string) : 1;
        const selectedSurah = surahs.find(s => s.id === id) || surahs[0];
        setCurrentSurah(selectedSurah);
        const ayahData = await QuranService.getAyahsBySurah(selectedSurah.id);
        setAyahs(ayahData);

        // Load bookmarks
        const bookmarks = await Promise.all(ayahData.map(a => QuranService.isBookmarked(a.id)));
        const bookmarkedSet = new Set<number>();
        ayahData.forEach((a, i) => {
          if (bookmarks[i]) bookmarkedSet.add(a.id);
        });
        setBookmarkedIds(bookmarkedSet);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAyah = async (ayah: Ayah) => {
    setActiveAyah(ayah);
    setIsAudioPlaying(true);
    await audioService.playAyah(ayah.surah_id, ayah.ayah_number, settings?.selectedSpeaker);
  };

  const handleBookmark = async (ayahId: number) => {
    const isNowBookmarked = await QuranService.toggleBookmark(ayahId);
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (isNowBookmarked) next.add(ayahId);
      else next.delete(ayahId);
      return next;
    });
  };

  const handleSaveReflection = async (note: string) => {
    if (reflectionAyah) {
      await QuranService.saveReflection(reflectionAyah.id, note);
      Alert.alert('Success', 'Reflection saved successfully!');
    }
  };

  const handleLoop = (ayahId: number) => {
    if (loopingAyahId === ayahId) {
      setLoopingAyahId(null);
      audioService.setLooping(false);
    } else {
      setLoopingAyahId(ayahId);
      audioService.setLooping(true);
    }
  };

  const handlePlayPause = async () => {
    if (isAudioPlaying) {
      await audioService.pause();
    } else {
      await audioService.resume();
    }
    setIsAudioPlaying(!isAudioPlaying);
  };

  const handleSkip = async (direction: 'next' | 'prev') => {
    if (!activeAyah || !currentSurah) return;
    const currentIndex = ayahs.findIndex(a => a.id === activeAyah.id);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (nextIndex >= 0 && nextIndex < ayahs.length) {
      handlePlayAyah(ayahs[nextIndex]);
    } else if (direction === 'next') {
      const nextSurahId = currentSurah.id < 114 ? currentSurah.id + 1 : 1;
      router.setParams({ surahId: nextSurahId.toString() });
    }
  };

  useEffect(() => {
    audioService.setOnFinishedListener(() => {
      handleSkip('next');
    });
    return () => audioService.setOnFinishedListener(null);
  }, [activeAyah, ayahs, currentSurah]);

  useEffect(() => {
    if (isAudioPlaying && ayahs.length > 0 && activeAyah?.surah_id !== currentSurah?.id) {
      handlePlayAyah(ayahs[0]);
    }
  }, [ayahs]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <TouchableOpacity style={[styles.headerTitle, { backgroundColor: theme.primary + '10', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }]} onPress={() => router.push('/surahs')}>
              <Image 
                source={require('../../assets/images/icon.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={[styles.surahName, { color: theme.primary }]}>
                {currentSurah?.name_transliteration || 'Select Surah'}
              </Text>
              <ChevronDown size={16} color={theme.primary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => router.push('/search')} style={styles.headerButton}>
                <Search size={24} color={theme.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(tabs)/settings')} style={styles.headerButton}>
                <Settings size={24} color={theme.primary} />
              </TouchableOpacity>
            </View>
          ),
          headerStyle: { backgroundColor: theme.background },
          headerShadowVisible: false,
        }}
      />

      <FlatList
        data={ayahs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AyahCard 
            ayah={item} 
            isDark={settings?.theme === 'dark' || (settings?.theme === undefined && systemColorScheme === 'dark')}
            isBookmarked={bookmarkedIds.has(item.id)}
            isLooping={loopingAyahId === item.id}
            fontSize={settings?.fontSize}
            showTranslationEnabled={settings?.translationEnabled}
            transliterationEnabled={settings?.transliterationEnabled}
            wordByWordEnabled={settings?.wordByWordEnabled}
            onPlay={() => handlePlayAyah(item)}
            onBookmark={() => handleBookmark(item.id)}
            onReflect={() => {
              setReflectionAyah(item);
              setReflectionVisible(true);
            }}
            onLoop={() => handleLoop(item.id)}
          />
        )}
        contentContainerStyle={[styles.listContent, isAudioPlaying && { paddingBottom: 100 }]}
        ListHeaderComponent={
          currentSurah ? (
            <View style={styles.surahHeader}>
              <Text style={[styles.bismillah, { color: theme.primary }]}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </Text>
              <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
                <Text style={{ color: theme.textSecondary }}>{currentSurah.revelation_type}</Text>
                <Text style={{ color: theme.textSecondary }}>{currentSurah.total_ayahs} Ayahs</Text>
              </View>
            </View>
          ) : null
        }
      />

      <ReflectionModal
        visible={reflectionVisible}
        ayahReference={`${currentSurah?.name_transliteration} ${reflectionAyah?.ayah_number}`}
        onClose={() => setReflectionVisible(false)}
        onSave={handleSaveReflection}
      />

      {activeAyah && (
        <AudioController 
          currentAyah={`${currentSurah?.name_transliteration} ${activeAyah.ayah_number}`}
          isPlaying={isAudioPlaying}
          onPlayPause={handlePlayPause}
          onSkipBack={() => handleSkip('prev')}
          onSkipForward={() => handleSkip('next')}
          onClose={() => {
            setIsAudioPlaying(false);
            setActiveAyah(null);
            audioService.stop();
          }}
        />
      )}

      {!isAudioPlaying && (
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/surahs')}
        >
          <BookOpen size={24} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 10,
    borderRadius: 8,
  },
  surahName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  surahHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  bismillah: {
    fontSize: 28,
    fontFamily: 'System',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
