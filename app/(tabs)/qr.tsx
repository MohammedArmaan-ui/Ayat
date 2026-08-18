import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, useColorScheme, Image, Dimensions, Share } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Share2, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react-native';

import { Text } from '@/components/Themed';
import { Colors } from '../../src/theme/colors';
import { SettingsService, AppSettings } from '../../src/services/settingsService';

const { width } = Dimensions.get('window');

export default function QrScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const systemColorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await SettingsService.getSettings();
    setSettings(s);
  };

  const theme = settings ? (Colors as any)[settings.theme] : (Colors as any)[systemColorScheme];

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Ayat App - Preview in Expo Go',
        message: 'Preview the Ayat App live in Expo Go! Open your Expo Go app and scan the QR code to test.\n\n— Ayat Islamic Companion',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.surface }]}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Expo Go Preview</Text>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.surface }]}
            onPress={handleShare}
          >
            <Share2 size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <View style={[styles.qrCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.badge, { backgroundColor: theme.primary + '15' }]}>
            <Sparkles size={14} color={theme.primary} />
            <Text style={[styles.badgeText, { color: theme.primary }]}>Live App Preview</Text>
          </View>

          <Text style={[styles.title, { color: theme.text }]}>Scan with Expo Go</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Open the Expo Go app on your Android or iOS device and scan this QR code to test Ayat in real-time.
          </Text>

          {/* QR Code Container */}
          <View style={[styles.qrImageContainer, { borderColor: theme.primary + '30', backgroundColor: '#FFFFFF' }]}>
            <Image
              source={require('../../assets/images/expo-qr.png')}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </View>

          {/* Action Row */}
          <TouchableOpacity
            style={[styles.copyButton, { backgroundColor: copied ? '#10B98115' : theme.primary + '12' }]}
            onPress={handleCopy}
            activeOpacity={0.8}
          >
            {copied ? (
              <>
                <CheckCircle2 size={18} color="#10B981" />
                <Text style={[styles.copyButtonText, { color: '#10B981' }]}>Ready in Expo Go!</Text>
              </>
            ) : (
              <>
                <Smartphone size={18} color={theme.primary} />
                <Text style={[styles.copyButtonText, { color: theme.primary }]}>Open in Expo Go</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Step-by-step Guide */}
        <View style={[styles.guideSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.guideHeading, { color: theme.text }]}>How to review on your phone:</Text>
          
          <View style={styles.stepRow}>
            <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>Install Expo Go</Text>
              <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
                Download Expo Go from the Google Play Store (Android) or App Store (iOS).
              </Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>Scan QR Code</Text>
              <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
                Android: Scan with Expo Go app.{'\n'}iOS: Scan using the native Camera app.
              </Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>Enjoy & Test</Text>
              <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
                Review Quran reader, prayer times, zakat calculator, stories, and audio seamlessly.
              </Text>
            </View>
          </View>
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
    paddingBottom: 40,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  qrCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  qrImageContainer: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  qrImage: {
    width: width * 0.55,
    height: width * 0.55,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    width: '100%',
    justifyContent: 'center',
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  guideSection: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  guideHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
});
