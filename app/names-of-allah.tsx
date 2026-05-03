import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, useColorScheme, Animated, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { Heart, Search, Info } from 'lucide-react-native';

import { Text } from '@/components/Themed';
import { Colors } from '../src/theme/colors';
import { SettingsService, AppSettings } from '../src/services/settingsService';
import { NAMES_OF_ALLAH, AllahName } from '../src/constants/namesOfAllahData';

const { width } = Dimensions.get('window');

export default function NamesOfAllahScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const systemColorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await SettingsService.getSettings();
    setSettings(s);
  };

  const theme = settings ? (Colors as any)[settings.theme] : (Colors as any)[systemColorScheme];

  const filteredNames = NAMES_OF_ALLAH.filter(n => 
    n.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const NameCard = ({ item }: { item: AllahName }) => (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.numberContainer, { backgroundColor: theme.primary + '15' }]}>
        <Text style={[styles.number, { color: theme.primary }]}>{item.id}</Text>
      </View>
      <View style={styles.nameInfo}>
        <Text style={[styles.arabicName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.transliteration, { color: theme.primary }]}>{item.transliteration}</Text>
        <Text style={[styles.meaning, { color: theme.textSecondary }]}>{item.meaning}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen 
        options={{ 
          title: '99 Names of Allah',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.primary,
          headerShadowVisible: false,
        }} 
      />

      <FlatList
        data={filteredNames}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <NameCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Asmā' Allah al-Husnā — The Most Beautiful Names of Allah.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: (width - 48) / 2,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  numberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  number: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  nameInfo: {
    alignItems: 'center',
  },
  arabicName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  transliteration: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  meaning: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
