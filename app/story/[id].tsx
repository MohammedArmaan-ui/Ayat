import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, useColorScheme, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Clock } from 'lucide-react-native';

import { Text } from '@/components/Themed';
import { Colors } from '../../src/theme/colors';
import { SettingsService, AppSettings } from '../../src/services/settingsService';
import { STORIES } from '../../src/constants/storiesData';

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const systemColorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await SettingsService.getSettings();
    setSettings(s);
  };

  const theme = settings ? (Colors as any)[settings.theme] : (Colors as any)[systemColorScheme];
  
  const story = STORIES.find(s => s.id === id);

  if (!story) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>Story not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
          {story.title}
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.metaContainer}>
          <Text style={[styles.categoryBadge, { color: theme.primary, backgroundColor: theme.surface }]}>
            {story.category}
          </Text>
          <View style={styles.timeContainer}>
            <Clock size={14} color={theme.textSecondary} />
            <Text style={[styles.readTime, { color: theme.textSecondary }]}>{story.readTime}</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: theme.text }]}>{story.title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{story.subtitle}</Text>
        
        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <Text style={[styles.content, { color: theme.text }]}>
          {story.content}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readTime: {
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 24,
  },
  content: {
    fontSize: 18,
    lineHeight: 30,
  },
});
