import React, { useState } from 'react';
import { StyleSheet, TextInput, FlatList, View, TouchableOpacity, useColorScheme } from 'react-native';
import { Search as SearchIcon, X } from 'lucide-react-native';
import { Stack } from 'expo-router';

import { Text } from '@/components/Themed';
import { db } from '../src/database/db';
import { Ayah } from '../src/models/types';
import { AyahCard } from '../src/components/AyahCard';
import { Colors } from '../src/theme/colors';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Ayah[]>([]);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = (Colors as any)[colorScheme] || Colors.light;

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }

    try {
      const searchResults = await db.getAllAsync<Ayah>(`
        SELECT a.*, t.text as translation 
        FROM ayah a
        LEFT JOIN translation t ON a.id = t.ayah_id AND t.language = 'en'
        WHERE a.text_uthmani LIKE ? OR t.text LIKE ?
        LIMIT 20
      `, [`%${text}%`, `%${text}%`]);
      setResults(searchResults);
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
        data={results}
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
});
