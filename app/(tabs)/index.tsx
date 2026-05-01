import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Search, Settings, ChevronDown } from 'lucide-react-native';

import { Text } from '@/components/Themed';
import { AyahCard } from '../../src/components/AyahCard';
import { AudioController } from '../../src/components/AudioController';
import { ReflectionModal } from '../../src/components/ReflectionModal';
import { QuranService } from '../../src/services/quranService';
import { audioService } from '../../src/services/audioService';
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
  
  const colorScheme = useColorScheme() ?? 'light';
  const theme = (Colors as any)[colorScheme] || Colors.light;
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, [surahId]);

  const loadData = async () => {
    setLoading(true);
    try {
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
    await audioService.playAyah(ayah.surah_id, ayah.ayah_number);
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
      // If this ayah is already playing, it will start looping
      // If not, it will loop when played
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
    if (!activeAyah) return;
    const currentIndex = ayahs.findIndex(a => a.id === activeAyah.id);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (nextIndex >= 0 && nextIndex < ayahs.length) {
      handlePlayAyah(ayahs[nextIndex]);
    }
  };

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
            <TouchableOpacity style={styles.headerTitle} onPress={() => router.push('/surahs')}>
              <Text style={[styles.surahName, { color: theme.primary }]}>
                {currentSurah?.name_transliteration || 'Loading...'}
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
            isDark={colorScheme === 'dark'}
            isBookmarked={bookmarkedIds.has(item.id)}
            isLooping={loopingAyahId === item.id}
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
});

