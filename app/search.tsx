import React, { useState } from 'react';
import { StyleSheet, TextInput, FlatList, View, TouchableOpacity, useColorScheme } from 'react-native';
import { Search as SearchIcon, X } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';

import { Text } from '@/components/Themed';
import { db } from '../src/database/db';
import { Ayah } from '../src/models/types';
import { AyahCard } from '../src/components/AyahCard';
import { Colors } from '../src/theme/colors';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [ayahResults, setAyahResults] = useState<Ayah[]>([]);
  const [surahResults, setSurahResults] = useState<any[]>([]);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = (Colors as any)[colorScheme] || Colors.light;
  const router = useRouter();

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setAyahResults([]);
      setSurahResults([]);
      return;
    }

    try {
      // Search Surahs
      const sResults = await db.getAllAsync<any>(`
        SELECT * FROM surah 
        WHERE name_transliteration LIKE ? OR name_translation LIKE ?
        LIMIT 5
      `, [`%${text}%`, `%${text}%`]);
      setSurahResults(sResults);

      // Search Ayahs
      const aResults = await db.getAllAsync<Ayah>(`
        SELECT a.*, t.text as translation 
        FROM ayah a
        LEFT JOIN translation t ON a.id = t.ayah_id AND t.language = 'en'
        WHERE a.text_uthmani LIKE ? OR t.text LIKE ?
        LIMIT 15
      `, [`%${text}%`, `%${text}%`]);
      setAyahResults(aResults);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Search Ayah' }} />
      
      <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <SearchIcon size={20} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Search Arabic or translation..."
          placeholderTextColor={theme.textSecondary}
          value={query}
          onChangeText={handleSearch}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <X size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={[
          ...(surahResults.length > 0 ? [{ type: 'header', title: 'Surahs' }] : []),
          ...surahResults.map(s => ({ ...s, type: 'surah' })),
          ...(ayahResults.length > 0 ? [{ type: 'header', title: 'Verses' }] : []),
          ...ayahResults.map(a => ({ ...a, type: 'ayah' }))
        ]}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <View style={styles.headerRow}>
                <Text style={[styles.headerText, { color: theme.primary }]}>{item.title}</Text>
              </View>
            );
          }

          if (item.type === 'surah') {
            return (
              <TouchableOpacity 
                style={[styles.surahItem, { borderBottomColor: theme.border }]}
                onPress={() => {
                  router.replace({
                    pathname: '/(tabs)',
                    params: { surahId: item.id }
                  });
                }}
              >
                <View style={styles.surahInfo}>
                  <Text style={[styles.surahName, { color: theme.text }]}>{item.name_transliteration}</Text>
                  <Text style={[styles.surahTranslation, { color: theme.textSecondary }]}>{item.name_translation}</Text>
                </View>
                <Text style={[styles.surahArabic, { color: theme.primary }]}>{item.name_arabic}</Text>
              </TouchableOpacity>
            );
          }

          return (
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
          );
        }}
        ListEmptyComponent={
          query.length > 1 ? (
            <Text style={styles.emptyText}>No results found for "{query}"</Text>
          ) : (
            <Text style={styles.emptyText}>Start typing to search...</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#6B7280',
    fontSize: 16,
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(6, 78, 59, 0.05)',
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  surahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  surahTranslation: {
    fontSize: 13,
  },
  surahArabic: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
