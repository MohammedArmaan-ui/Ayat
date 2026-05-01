import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react-native';
import { Text } from '@/components/Themed';
import { Colors } from '../theme/colors';

interface AudioControllerProps {
  currentAyah: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onClose: () => void;
}

export const AudioController: React.FC<AudioControllerProps> = ({ 
  currentAyah, 
  isPlaying,
  onPlayPause,
  onSkipBack,
  onSkipForward,
  onClose 
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = (Colors as any)[colorScheme] || Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
      <View style={styles.info}>
        <Text style={[styles.nowPlaying, { color: theme.textSecondary }]}>NOW RECITING</Text>
        <Text style={[styles.ayahText, { color: theme.text }]}>{currentAyah}</Text>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={onSkipBack}>
          <SkipBack size={24} color={theme.primary} fill={theme.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.playButton, { backgroundColor: theme.primary }]}
          onPress={onPlayPause}
        >
          {isPlaying ? (
            <Pause size={28} color="#FFF" fill="#FFF" />
          ) : (
            <Play size={28} color="#FFF" fill="#FFF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={onSkipForward}>
          <SkipForward size={24} color={theme.primary} fill={theme.primary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <X size={20} color={theme.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  info: {
    flex: 1,
  },
  nowPlaying: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  ayahText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  closeButton: {
    padding: 8,
    marginLeft: 8,
  },
});
