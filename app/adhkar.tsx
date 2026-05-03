import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, useColorScheme, Animated, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { Sun, Moon, ChevronRight, CheckCircle2 } from 'lucide-react-native';

import { Text } from '@/components/Themed';
import { Colors } from '../src/theme/colors';
import { SettingsService, AppSettings } from '../src/services/settingsService';
import { DUAS, Dua } from '../src/constants/duasData';

const { width } = Dimensions.get('window');

export default function AdhkarScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'Morning' | 'Evening'>('Morning');
  const systemColorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await SettingsService.getSettings();
    setSettings(s);
  };

  const theme = settings ? (Colors as any)[settings.theme] : (Colors as any)[systemColorScheme];

  const filteredAdhkar = DUAS.filter(d => d.category === activeTab);

  const AdhkarCard = ({ item }: { item: Dua }) => (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.cardTitle, { color: theme.primary }]}>{item.title}</Text>
      <Text style={[styles.arabicText, { color: theme.text }]}>{item.arabic}</Text>
      <Text style={[styles.transliteration, { color: theme.textSecondary }]}>{item.transliteration}</Text>
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <Text style={[styles.translation, { color: theme.text }]}>{item.translation}</Text>
      <Text style={[styles.reference, { color: theme.textSecondary }]}>{item.reference}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen 
        options={{ 
          title: 'Daily Adhkar',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.primary,
          headerShadowVisible: false,
        }} 
      />

      <View style={styles.tabBar}>
        <TouchableOpacity 
          onPress={() => setActiveTab('Morning')}
          style={[
            styles.tab, 
            activeTab === 'Morning' && { backgroundColor: theme.primary + '20', borderColor: theme.primary }
          ]}
        >
          <Sun size={20} color={activeTab === 'Morning' ? theme.primary : theme.textSecondary} />
          <Text style={[styles.tabLabel, { color: activeTab === 'Morning' ? theme.primary : theme.textSecondary }]}>Morning</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setActiveTab('Evening')}
          style={[
            styles.tab, 
            activeTab === 'Evening' && { backgroundColor: theme.primary + '20', borderColor: theme.primary }
          ]}
        >
          <Moon size={20} color={activeTab === 'Evening' ? theme.primary : theme.textSecondary} />
          <Text style={[styles.tabLabel, { color: activeTab === 'Evening' ? theme.primary : theme.textSecondary }]}>Evening</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredAdhkar.map((item) => (
          <AdhkarCard key={item.id} item={item} />
        ))}
        
        {filteredAdhkar.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ color: theme.textSecondary }}>No adhkar found for this category.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 8,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  arabicText: {
    fontSize: 24,
    textAlign: 'right',
    lineHeight: 42,
    marginBottom: 16,
  },
  transliteration: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 16,
    opacity: 0.5,
  },
  translation: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  reference: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  }
});
