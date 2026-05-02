import React, { useCallback, useState } from 'react';
import { StyleSheet, FlatList, View, useColorScheme } from 'react-native';
import { Bookmark as BookmarkIcon } from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { Text } from '@/components/Themed';
import { AyahCard } from '../../src/components/AyahCard';
import { db } from '../../src/database/db';
import { Ayah } from '../../src/models/types';
import { Colors } from '../../src/theme/colors';

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState<Ayah[]>([]);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = (Colors as any)[colorScheme] || Colors.light;
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [])
  );

  const loadBookmarks = async () => {
    try {
      const savedAyahs = await db.getAllAsync<Ayah>(`
        SELECT a.*, t.text as translation 
        FROM ayah a
        JOIN bookmark b ON a.id = b.ayah_id
        LEFT JOIN translation t ON a.id = t.ayah_id AND t.language = 'en'
        ORDER BY b.created_at DESC
      `);
      setBookmarks(savedAyahs);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AyahCard 
            ayah={item} 
            isDark={colorScheme === 'dark'}
            onPlay={() => {
              router.replace({
                pathname: '/(tabs)',
                params: { surahId: item.surah_id }
              });
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <BookmarkIcon size={64} color={theme.border} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No bookmarks yet.
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Tap the bookmark icon on any ayah to save it here.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
