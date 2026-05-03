import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, useColorScheme, Animated, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ChevronLeft, Share2, BookOpen, Clock } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

import { Text } from '@/components/Themed';
import { Colors } from '../../src/theme/colors';
import { SettingsService, AppSettings } from '../../src/services/settingsService';
import { STORIES } from '../../src/constants/storiesData';

const { width } = Dimensions.get('window');

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const router = useRouter();
  const systemColorScheme = useColorScheme() ?? 'light';

  const story = STORIES.find(s => s.id === id);

  useEffect(() => {
    loadSettings();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadSettings = async () => {
    const s = await SettingsService.getSettings();
    setSettings(s);
  };

  const theme = settings ? (Colors as any)[settings.theme] : (Colors as any)[systemColorScheme];

  if (!story) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>Story not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: theme.primary, marginTop: 10 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Custom Header Area */}
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: theme.surface }]} 
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.surface }]}>
            <Share2 size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.titleSection}>
            <View style={[styles.categoryBadge, { backgroundColor: theme.primary + '15' }]}>
              <Text style={[styles.categoryText, { color: theme.primary }]}>{story.category}</Text>
            </View>
            <Text style={[styles.title, { color: theme.text }]}>{story.title}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <BookOpen size={16} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>Inspirational</Text>
              </View>
            </View>
          </View>

          <View style={[styles.contentCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.storyContent, { color: theme.text, fontSize: (settings?.fontSize || 18) - 2 }]}>
              {story.content}
            </Text>
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.finishButton, { backgroundColor: theme.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.finishButtonText}>Mark as Read</Text>
          </TouchableOpacity>
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
    paddingTop: 50,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleSection: {
    marginBottom: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
  },
  contentCard: {
    borderRadius: 24,
    padding: 24,
    lineHeight: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  storyContent: {
    lineHeight: 30,
    letterSpacing: 0.3,
  },
  footer: {
    marginTop: 40,
    marginBottom: 40,
  },
  finishButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
