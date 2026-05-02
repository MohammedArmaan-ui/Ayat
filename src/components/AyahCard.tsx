import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Play, Bookmark, MessageCircle, Repeat, Share2 } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Ayah } from '../models/types';

interface AyahCardProps {
  ayah: Ayah;
  isDark?: boolean;
  isBookmarked?: boolean;
  isLooping?: boolean;
  fontSize?: number;
  showTranslationEnabled?: boolean;
  transliterationEnabled?: boolean;
  wordByWordEnabled?: boolean;
  onPlay?: () => void;
  onBookmark?: () => void;
  onReflect?: () => void;
  onLoop?: () => void;
}

export const AyahCard: React.FC<AyahCardProps> = ({ 
  ayah, 
  isDark = false,
  isBookmarked = false,
  isLooping = false,
  fontSize = 24,
  showTranslationEnabled = true,
  transliterationEnabled = true,
  wordByWordEnabled = false,
  onPlay,
  onBookmark,
  onReflect,
  onLoop 
}) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const theme = isDark ? Colors.dark : Colors.light;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${ayah.text_uthmani}\n\n${ayah.translation}\n\n[Ayat App - ${ayah.surah_id}:${ayah.ayah_number}]`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={[styles.badgeText, { color: theme.primary }]}>{ayah.ayah_number}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onPlay} style={styles.iconButton}>
            <Play size={20} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onBookmark} style={styles.iconButton}>
            <Bookmark 
              size={20} 
              color={isBookmarked ? theme.secondary : theme.secondary} 
              fill={isBookmarked ? theme.secondary : 'transparent'} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onReflect} style={styles.iconButton}>
            <MessageCircle size={20} color={theme.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onLoop} style={styles.iconButton}>
            <Repeat size={20} color={isLooping ? theme.primary : theme.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
            <Share2 size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={() => setShowTranslation(!showTranslation)}
        style={styles.content}
      >
        <Text style={[styles.arabicText, { color: theme.text, fontSize }]}>
          {ayah.text_uthmani}
        </Text>
        
        {transliterationEnabled && ayah.transliteration && (
          <View style={styles.transliterationContainer}>
            <Text style={[styles.transliterationText, { color: theme.secondary }]}>
              {ayah.transliteration}
            </Text>
          </View>
        )}
        
        {wordByWordEnabled && (
          <View style={styles.wbwContainer}>
            <Text style={[styles.wbwText, { color: theme.primary }]}>
              [ Word-by-word analysis active ]
            </Text>
          </View>
        )}
        
        {(showTranslation || showTranslationEnabled) && ayah.translation && (
          <View style={styles.translationContainer}>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <Text style={[styles.translationText, { color: theme.textSecondary }]}>
              {ayah.translation}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(6, 78, 59, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 6,
    marginLeft: 4,
  },
  content: {
    paddingTop: 8,
  },
  arabicText: {
    fontSize: 26,
    lineHeight: 48,
    textAlign: 'right',
    fontFamily: 'System', // Will update to custom font later
    fontWeight: '500',
  },
  translationContainer: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 12,
  },
  translationText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
  },
  transliterationContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  transliterationText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  wbwContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 8,
    alignItems: 'center',
  },
  wbwText: {
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
});
