import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, Text, Pressable } from 'react-native';
import { Colors } from '../theme/colors';

const { height } = Dimensions.get('window');

export function CustomSplashScreen({ onFinish }: { onFinish: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      })
    ]).start();

    // Fast, responsive splash: 1000ms total so user never feels frozen
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const theme = Colors.light; // Using light emerald theme for splash

  return (
    <Pressable style={styles.container} onPress={onFinish}>
      <Animated.View style={[styles.inner, { opacity: fadeAnim, backgroundColor: theme.primary }]}>
        <View style={styles.content}>
          <Animated.Image 
            source={require('../../assets/images/icon.png')} 
            style={[styles.logo, { transform: [{ scale: logoScale }] }]}
            resizeMode="contain"
          />
          <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.appName}>Ayat</Text>
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.bismillah}>Bismillah hir Rahman nir Rahim</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 24,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  bismillah: {
    fontSize: 16,
    color: '#FFF',
    fontStyle: 'italic',
    opacity: 0.9,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
