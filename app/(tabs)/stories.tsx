import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { ChevronRight, Book } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Text } from '@/components/Themed';
import { Colors } from '../../src/theme/colors';
import { SettingsService, AppSettings } from '../../src/services/settingsService';
import { STORIES } from '../../src/constants/storiesData';

export default function StoriesScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const systemColorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await SettingsService.getSettings();
    setSettings(s);
  };

  const theme = settings ? (Colors as any)[settings.theme] : (Colors as any)[systemColorScheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Islamic Stories</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Inspiring tales from the Quran and Sunnah
          </Text>
        </View>

        <View style={styles.listContainer}>
          {STORIES.map((story) => (
            <TouchableOpacity 
              key={story.id} 
              style={[styles.storyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              activeOpacity={0.8}
              onPress={() => router.push(`/story/${story.id}`)}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.background }]}>
                <Book size={24} color={theme.primary} />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.categoryBadge, { color: theme.primary, backgroundColor: theme.background }]}>
                    {story.category}
                  </Text>
                  <Text style={[styles.readTime, { color: theme.textSecondary }]}>{story.readTime}</Text>
                </View>
                <Text style={[styles.storyTitle, { color: theme.text }]}>{story.title}</Text>
                <Text style={[styles.storySubtitle, { color: theme.textSecondary }]} numberOfLines={2}>
                  {story.subtitle}
                </Text>
              </View>
              <ChevronRight size={20} color={theme.border} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  listContainer: {
    gap: 16,
  },
  storyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    marginRight: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  readTime: {
    fontSize: 12,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  storySubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});
