import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, TouchableOpacity, Image, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { UzzaMood } from '../services/prayerPauseService';

interface UzzaCatProps {
  mood: UzzaMood;
  size?: number;
  onPress?: () => void;
}

// Assets generated directly from user's provided character sheet
const CAT_ASSETS: Record<UzzaMood, any> = {
  Thriving: require('../../assets/images/uzza/thriving.png'),
  Content: require('../../assets/images/uzza/content.png'),
  Peaceful: require('../../assets/images/uzza/peaceful.png'),
  Reminding: require('../../assets/images/uzza/reminding.png'),
  Sad: require('../../assets/images/uzza/sad.png'),
  Angry: require('../../assets/images/uzza/angry.png'),
};

const GLOW_COLORS: Record<UzzaMood, string> = {
  Thriving: 'rgba(245, 158, 11, 0.45)', // Golden sparkle halo
  Content: 'rgba(16, 185, 129, 0.35)',  // Serene green
  Peaceful: 'rgba(147, 197, 253, 0.35)', // Soft calm blue
  Reminding: 'rgba(245, 158, 11, 0.40)', // Amber alert
  Sad: 'rgba(156, 163, 175, 0.35)',     // Melancholy gray-blue
  Angry: 'rgba(239, 68, 68, 0.45)',     // Fiery red
};

export const UzzaCat: React.FC<UzzaCatProps> = ({ mood, size = 230, onPress }) => {
  const breatheAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Breathing & floating animation tailored to mood
    const duration =
      mood === 'Angry' ? 600
      : mood === 'Peaceful' ? 2600
      : mood === 'Thriving' ? 1400
      : 1900;

    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ])
    );
    breathing.start();
    return () => breathing.stop();
  }, [mood]);

  const handleTap = () => {
    try {
      if (mood === 'Angry') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else if (mood === 'Thriving') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {}

    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.12,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) onPress();
  };

  const translateY = breatheAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, mood === 'Angry' ? -2 : mood === 'Peaceful' ? -3 : -7],
  });

  const scale = breatheAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, mood === 'Peaceful' ? 1.02 : 1.03],
  });

  const catSource = CAT_ASSETS[mood] || CAT_ASSETS.Content;
  const haloColor = GLOW_COLORS[mood] || GLOW_COLORS.Content;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handleTap} style={styles.container}>
      <Animated.View
        style={[
          styles.catWrapper,
          {
            width: size,
            height: size * 0.9,
            transform: [
              { translateY },
              { scale },
              { scale: bounceAnim },
            ],
          },
        ]}
      >
        {/* Ambient Mood Halo */}
        <View
          style={[
            styles.glowHalo,
            {
              width: size * 0.85,
              height: size * 0.85,
              borderRadius: (size * 0.85) / 2,
              backgroundColor: haloColor,
            },
          ]}
        />

        {/* Crisp Kitten Sprite */}
        <Image
          source={catSource}
          style={[styles.catImage, { width: size, height: size * 0.88 }]}
          resizeMode="contain"
        />

        {/* Ground Soft Shadow */}
        <View
          style={[
            styles.groundShadow,
            {
              width: size * 0.65,
              bottom: 4,
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  catWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowHalo: {
    position: 'absolute',
    top: '8%',
    opacity: 0.65,
  },
  catImage: {
    zIndex: 2,
  },
  groundShadow: {
    position: 'absolute',
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    zIndex: 1,
  },
});
