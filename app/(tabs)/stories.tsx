import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, useColorScheme, TextInput } from 'react-native';
import { ChevronRight, Book, Search, X, Sparkles, BookOpen } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Text } from '@/components/Themed';
import { Colors } from '../../src/theme/colors';
import { SettingsService, AppSettings } from '../../src/services/settingsService';
import { STORIES } from '../../src/constants/storiesData';

const CATEGORIES = ['All', 'Prophets', 'Sahabah', 'Quranic Tales', 'Past Events', 'Islamic Wisdom'];

export default function StoriesScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
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

  // Filter stories based on query and category
  const filteredStories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return STORIES.filter(story => {
      const matchesCategory = selectedCategory === 'All' || story.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!query) return true;
      return (
        story.title.toLowerCase().includes(query) ||
        story.subtitle.toLowerCase().includes(query) ||
        story.category.toLowerCase().includes(query) ||
        story.content.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, selectedCategory]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Islamic Stories</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Inspiring tales from the Quran, Sahabah, and Sunnah
          </Text>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Search size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search prophets, companions, lessons..."
            placeholderTextColor={theme.textSecondary + '90'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <X size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.surface,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.text,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Results Counter */}
        <View style={styles.countRow}>
          <Text style={[styles.countText, { color: theme.textSecondary }]}>
            {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'} available
          </Text>
        </View>

        {/* Stories List */}
        {filteredStories.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <BookOpen size={48} color={theme.primary + '80'} style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No stories found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Try searching with different keywords or switch the category filter.
            </Text>
            {(searchQuery.length > 0 || selectedCategory !== 'All') && (
              <TouchableOpacity
                style={[styles.resetButton, { backgroundColor: theme.primary }]}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredStories.map(story => (
              <TouchableOpacity
                key={story.id}
                style={[styles.storyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                activeOpacity={0.8}
                onPress={() => router.push(`/story/${story.id}` as any)}
              >
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '12' }]}>
                  <Book size={22} color={theme.primary} />
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.categoryBadge, { color: theme.primary, backgroundColor: theme.primary + '12' }]}>
                      {story.category}
                    </Text>
                    {story.readTime && (
                      <Text style={[styles.readTimeText, { color: theme.textSecondary }]}>
                        {story.readTime}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.storyTitle, { color: theme.text }]}>{story.title}</Text>
                  <Text style={[styles.storySubtitle, { color: theme.textSecondary }]} numberOfLines={2}>
                    {story.subtitle}
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.textSecondary + '80'} />
              </TouchableOpacity>
            ))}
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
  readTimeText: {
    fontSize: 11,
    fontWeight: '600',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    height: 52,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  clearButton: {
    padding: 6,
  },
  categoryScroll: {
    maxHeight: 44,
    marginBottom: 16,
  },
  categoryScrollContent: {
    gap: 8,
    paddingRight: 12,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 13,
  },
  countRow: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  resetButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
