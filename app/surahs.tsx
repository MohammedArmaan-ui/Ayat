import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, useColorScheme, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Search, ChevronRight } from 'lucide-react-native';

import { Text } from '@/components/Themed';
import { QuranService } from '../src/services/quranService';
import { Surah } from '../src/models/types';
import { Colors } from '../src/theme/colors';

export default function SurahListScreen() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const colorScheme = useColorScheme() ?? 'light';
  const theme = (Colors as any)[colorScheme] || Colors.light;
  const router = useRouter();

  useEffect(() => {
    loadSurahs();
  }, []);

  const loadSurahs = async () => {
    const data = await QuranService.getSurahs();
    setSurahs(data);
  };

  const filteredSurahs = surahs.filter(s => 
    s.name_transliteration.toLowerCase().includes(search.toLowerCase()) ||
    s.name_translation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Select Surah' }} />
      
      <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Search size={20} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Search surah..."
          placeholderTextColor={theme.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredSurahs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.item, { borderBottomColor: theme.border }]}
            onPress={() => {
              router.replace({
                pathname: '/(tabs)/reader',
                params: { surahId: item.id }
              });
            }}
          >
            <View style={[styles.numberContainer, { backgroundColor: 'rgba(6, 78, 59, 0.1)' }]}>
              <Text style={[styles.number, { color: theme.primary }]}>{item.id}</Text>
            </View>
            <View style={styles.nameContainer}>
              <Text style={[styles.transliteration, { color: theme.text }]}>{item.name_transliteration}</Text>
              <Text style={[styles.translation, { color: theme.textSecondary }]}>{item.name_translation}</Text>
            </View>
            <View style={styles.arabicContainer}>
              <Text style={[styles.arabic, { color: theme.primary }]}>{item.name_arabic}</Text>
              <Text style={[styles.ayahCount, { color: theme.textSecondary }]}>{item.total_ayahs} Ayahs</Text>
            </View>
            <ChevronRight size={20} color={theme.border} />
          </TouchableOpacity>
        )}
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
    height: 45,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  numberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  number: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  nameContainer: {
    flex: 1,
  },
  transliteration: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  translation: {
    fontSize: 13,
  },
  arabicContainer: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  arabic: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ayahCount: {
    fontSize: 12,
  },
});
