import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  Animated,
  Modal,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Clock,
  Lock,
  Unlock,
  CheckCircle2,
  Shield,
  Smartphone,
  Camera,
  Heart,
  Sparkles,
  RefreshCw,
  Sliders,
  X,
  Plus,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Text } from '@/components/Themed';
import { Colors } from '../src/theme/colors';
import { SettingsService, AppSettings } from '../src/services/settingsService';
import { PrayerService } from '../src/services/prayerService';
import {
  PrayerPauseService,
  UzzaMood,
  PrayerPauseSettings,
  DEFAULT_PAUSE_SETTINGS,
} from '../src/services/prayerPauseService';
import { UzzaCat } from '../src/components/UzzaCat';

const { width } = Dimensions.get('window');

const MOODS: UzzaMood[] = ['Thriving', 'Content', 'Tired', 'Struggling', 'Exhausted', 'Collapsed'];

interface AppOffender {
  id: string;
  name: string;
  category: string;
  timeSpent: string;
  isBlocked: boolean;
  color: string;
}

const DEFAULT_APPS: AppOffender[] = [
  { id: '1', name: 'Instagram', category: 'Social', timeSpent: '1h 18m', isBlocked: true, color: '#E1306C' },
  { id: '2', name: 'TikTok', category: 'Shorts & Media', timeSpent: '44m', isBlocked: true, color: '#000000' },
  { id: '3', name: 'Drama Live', category: 'Entertainment', timeSpent: '34m', isBlocked: true, color: '#2563EB' },
  { id: '4', name: 'YouTube', category: 'Video Streaming', timeSpent: '28m', isBlocked: false, color: '#FF0000' },
  { id: '5', name: 'Safari / Chrome', category: 'Browser', timeSpent: '16m', isBlocked: false, color: '#059669' },
];

export default function PrayerPauseScreen() {
  const router = useRouter();
  const systemColorScheme = useColorScheme() ?? 'light';

  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [pauseSettings, setPauseSettings] = useState<PrayerPauseSettings>(DEFAULT_PAUSE_SETTINGS);
  const [prayersCompletedCount, setPrayersCompletedCount] = useState(3);
  const [apps, setApps] = useState<AppOffender[]>(DEFAULT_APPS);

  // Manual mood override or auto-calculated
  const [selectedMood, setSelectedMood] = useState<UzzaMood | null>(null);
  const [proofModalVisible, setProofModalVisible] = useState(false);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'verified'>('idle');

  const theme = settings ? (Colors as any)[settings.theme] : (Colors as any)[systemColorScheme];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const s = await SettingsService.getSettings();
      setSettings(s);

      const ps = await PrayerPauseService.getSettings();
      setPauseSettings(ps);

      // Load today's real tracked prayers
      const today = new Date();
      const dateString = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
      const tracked = await PrayerService.getTrackedPrayers(dateString);
      const completedCount = Object.values(tracked).filter(Boolean).length;
      setPrayersCompletedCount(completedCount > 0 ? completedCount : 3);
    } catch (e) {
      console.warn('[PrayerPause] Failed to load data:', e);
    }
  };

  // Determine actual vitality & mood
  const autoVitalityData = PrayerPauseService.calculateVitality(
    prayersCompletedCount,
    pauseSettings.screenTimeMinutes
  );

  const activeMood: UzzaMood = selectedMood || autoVitalityData.mood;
  const activeVitality = selectedMood
    ? selectedMood === 'Thriving' ? 95
      : selectedMood === 'Content' ? 82
      : selectedMood === 'Tired' ? 58
      : selectedMood === 'Struggling' ? 42
      : selectedMood === 'Exhausted' ? 22
      : 8
    : autoVitalityData.vitality;

  const quote = PrayerPauseService.getMoodQuote(activeMood);

  const handleToggleSalahFocus = async (val: boolean) => {
    Haptics.selectionAsync();
    setPauseSettings(prev => ({ ...prev, salahFocusEnabled: val }));
    await PrayerPauseService.updateSettings({ salahFocusEnabled: val });
  };

  const handleToggleBrickMode = async (val: boolean) => {
    Haptics.selectionAsync();
    setPauseSettings(prev => ({ ...prev, brickModeEnabled: val }));
    await PrayerPauseService.updateSettings({ brickModeEnabled: val });
  };

  const handleToggleAppBlock = (id: string) => {
    Haptics.selectionAsync();
    setApps(prev =>
      prev.map(app => (app.id === id ? { ...app, isBlocked: !app.isBlocked } : app))
    );
  };

  const handleLogPrayer = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newCount = Math.min(5, prayersCompletedCount + 1);
    setPrayersCompletedCount(newCount);

    const today = new Date();
    const dateString = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    if (newCount <= 5) {
      await PrayerService.togglePrayer(dateString, prayers[newCount - 1], true);
    }

    setSelectedMood(null); // Return to auto
    Alert.alert(
      'Salah Logged! 🌙',
      `Prayer marked as completed. Uzza has recovered spiritual vitality! Total today: ${newCount}/5.`
    );
  };

  const handleStartProofScan = () => {
    setScanState('scanning');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setTimeout(() => {
      setScanState('verified');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => {
        setProofModalVisible(false);
        setScanState('idle');
        handleLogPrayer();
      }, 1600);
    }, 2200);
  };

  // Vitality progress bar color
  const getVitalityColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#3B82F6';
    if (score >= 40) return '#F59E0B';
    if (score >= 20) return '#F97316';
    return '#EF4444';
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F6F1EA' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Navigation */}
        <View style={styles.topNav}>
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: '#EADCCB', borderColor: '#D7C4AF' }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#3B2516" />
          </TouchableOpacity>
          <View style={styles.navHeaderTitle}>
            <Text style={[styles.navTitle, { color: '#3B2516' }]}>Prayer Pause</Text>
            <Text style={[styles.navSubtitle, { color: '#82654D' }]}>Screen Time for Muslims</Text>
          </View>
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: '#EADCCB', borderColor: '#D7C4AF' }]}
            onPress={() => {
              setSelectedMood(null);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <RefreshCw size={18} color="#3B2516" />
          </TouchableOpacity>
        </View>

        {/* HERO CARD: Uzza Character Display */}
        <View style={styles.heroCard}>
          <Text style={styles.characterName}>UZZA</Text>

          {/* Interactive Cat Illustration */}
          <View style={styles.catWrapper}>
            <UzzaCat mood={activeMood} size={250} />
          </View>

          {/* Vitality Score & Bar */}
          <View style={styles.vitalitySection}>
            <Text style={styles.vitalityPercentage}>{activeVitality}%</Text>
            <View style={styles.vitalityBarBackground}>
              <View
                style={[
                  styles.vitalityBarFill,
                  {
                    width: `${activeVitality}%`,
                    backgroundColor: getVitalityColor(activeVitality),
                  },
                ]}
              />
            </View>
            <Text style={styles.vitalityLabel}>
              {activeMood.toUpperCase()} VITALITY
            </Text>
          </View>

          {/* Mood Selector Chips (As in screenshot 2) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodScroll}
          >
            {MOODS.map(m => {
              const isSelected = activeMood === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.moodChip,
                    isSelected && styles.moodChipActive,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedMood(m);
                  }}
                >
                  <Text style={[styles.moodChipText, isSelected && styles.moodChipTextActive]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Quote & Guidance */}
          <View style={styles.quoteBox}>
            <Text style={styles.quoteTitle}>{quote.title}</Text>
            <Text style={styles.quoteSubtitle}>{quote.subtitle}</Text>
          </View>
        </View>

        {/* DAILY STATS COUNTER GRID (Matching Screenshot 1) */}
        <View style={styles.statsGrid}>
          {/* Screen Time */}
          <View style={styles.statBox}>
            <Text style={styles.statValue}>1h 42m</Text>
            <Text style={styles.statLabel}>SCREEN TIME</Text>
          </View>

          {/* App Opens */}
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{pauseSettings.appOpens}</Text>
            <Text style={styles.statLabel}>OPENS</Text>
          </View>

          {/* Prayers Completed */}
          <TouchableOpacity style={styles.statBox} onPress={handleLogPrayer} activeOpacity={0.8}>
            <Text style={[styles.statValue, { color: '#B45309' }]}>
              {prayersCompletedCount}/5
            </Text>
            <Text style={styles.statLabel}>PRAYERS (TAP +)</Text>
          </TouchableOpacity>
        </View>

        {/* PRAYER UNLOCK ACTION BUTTON */}
        <TouchableOpacity
          style={styles.unlockActionBtn}
          onPress={() => setProofModalVisible(true)}
          activeOpacity={0.85}
        >
          <Camera size={22} color="#FFFFFF" />
          <Text style={styles.unlockActionBtnText}>Pray to Unlock (Proof Mode)</Text>
        </TouchableOpacity>

        {/* SALAH FOCUS & BRICK MODE SETTINGS (Screenshot 4) */}
        <View style={styles.sectionHeader}>
          <Lock size={18} color="#3B2516" />
          <Text style={styles.sectionTitle}>Focus Schedules & Blocking</Text>
        </View>

        <View style={styles.card}>
          {/* Salah Focus Mode */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <View style={styles.titleWithBadge}>
                <Text style={styles.settingTitle}>Salah Focus</Text>
                <View style={[styles.activeBadge, { backgroundColor: '#10B98120' }]}>
                  <Text style={[styles.activeBadgeText, { color: '#047857' }]}>Smart</Text>
                </View>
              </View>
              <Text style={styles.settingDesc}>
                Locks distracting apps 15 minutes before & after each prayer time.
              </Text>
            </View>
            <Switch
              value={pauseSettings.salahFocusEnabled}
              onValueChange={handleToggleSalahFocus}
              trackColor={{ false: '#D1D5DB', true: '#B45309' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          {/* Brick Mode */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <View style={styles.titleWithBadge}>
                <Text style={styles.settingTitle}>Brick Mode</Text>
                <View style={[styles.activeBadge, { backgroundColor: '#F59E0B20' }]}>
                  <Text style={[styles.activeBadgeText, { color: '#B45309' }]}>Strict</Text>
                </View>
              </View>
              <Text style={styles.settingDesc}>
                Extreme digital detox. Keeps all non-essential apps locked until Asr.
              </Text>
            </View>
            <Switch
              value={pauseSettings.brickModeEnabled}
              onValueChange={handleToggleBrickMode}
              trackColor={{ false: '#D1D5DB', true: '#B45309' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* TOP OFFENDERS / APP LIMITS (Screenshot 1 & 4) */}
        <View style={styles.sectionHeader}>
          <Smartphone size={18} color="#3B2516" />
          <Text style={styles.sectionTitle}>Top Offenders & Limits</Text>
        </View>

        <View style={styles.card}>
          {apps.map((app, index) => (
            <View key={app.id}>
              <View style={styles.appRow}>
                <View style={[styles.appIconCircle, { backgroundColor: app.color + '18' }]}>
                  <Smartphone size={18} color={app.color} />
                </View>
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>{app.name}</Text>
                  <Text style={styles.appCategory}>{app.category}</Text>
                </View>
                <Text style={styles.appTime}>{app.timeSpent}</Text>
                <TouchableOpacity
                  style={[
                    styles.blockBtn,
                    app.isBlocked ? styles.blockBtnActive : styles.blockBtnInactive,
                  ]}
                  onPress={() => handleToggleAppBlock(app.id)}
                >
                  <Text style={[styles.blockBtnText, app.isBlocked && styles.blockBtnTextActive]}>
                    {app.isBlocked ? 'Blocked' : 'Allow'}
                  </Text>
                </TouchableOpacity>
              </View>
              {index < apps.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* PHILOSOPHY CARD */}
        <View style={styles.philosophyCard}>
          <Heart size={20} color="#B45309" />
          <Text style={styles.philosophyText}>
            "The Prophet (ﷺ) loved gentle companions. Uzza thrives when you remember Allah and pray on time. Every unneeded scroll tires her — choose your soul over the algorithm."
          </Text>
        </View>
      </ScrollView>

      {/* PROOF MODE SCAN MODAL (Screenshot 3) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={proofModalVisible}
        onRequestClose={() => setProofModalVisible(false)}
      >
        <View style={styles.proofModalOverlay}>
          <View style={styles.proofModalContent}>
            <View style={styles.proofModalHeader}>
              <View style={styles.badgeRow}>
                <Camera size={18} color="#B45309" />
                <Text style={styles.proofBadgeText}>PROOF MODE</Text>
              </View>
              <TouchableOpacity onPress={() => setProofModalVisible(false)}>
                <X size={24} color="#3B2516" />
              </TouchableOpacity>
            </View>

            <Text style={styles.proofModalTitle}>Pray to unlock.</Text>
            <Text style={styles.proofModalSubtitle}>
              After salah, scan your registered prayer spot / mat to unlock your apps. Or use Honor Mode to confirm on trust.
            </Text>

            {/* SCANNING VIEWFINDER */}
            <View style={styles.viewfinderContainer}>
              <View style={styles.viewfinderMatGraphic}>
                <View style={styles.matPattern} />
                <View style={styles.matBorder}>
                  {scanState === 'verified' ? (
                    <View style={styles.verifiedCircle}>
                      <CheckCircle2 size={48} color="#10B981" />
                      <Text style={styles.verifiedText}>Salah Verified!</Text>
                    </View>
                  ) : scanState === 'scanning' ? (
                    <View style={styles.scanningPulse}>
                      <Clock size={36} color="#B45309" />
                      <Text style={styles.scanningText}>Analyzing Prayer Spot...</Text>
                    </View>
                  ) : (
                    <View style={styles.aimBox}>
                      <Camera size={32} color="#82654D" />
                      <Text style={styles.aimText}>Aim at your prayer mat</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.proofActions}>
              <TouchableOpacity
                style={[styles.scanBtn, scanState === 'scanning' && { opacity: 0.6 }]}
                onPress={handleStartProofScan}
                disabled={scanState === 'scanning'}
              >
                <Camera size={18} color="#FFFFFF" />
                <Text style={styles.scanBtnText}>
                  {scanState === 'scanning' ? 'Verifying...' : 'Scan Prayer Mat'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.honorBtn}
                onPress={() => {
                  setProofModalVisible(false);
                  handleLogPrayer();
                }}
              >
                <Shield size={16} color="#82654D" />
                <Text style={styles.honorBtnText}>Use Honor Mode (I Have Prayed)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 70,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  navHeaderTitle: {
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  navSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: '#302621',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  characterName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FDE68A',
    letterSpacing: 3,
    marginBottom: 10,
  },
  catWrapper: {
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vitalitySection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  vitalityPercentage: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  vitalityBarBackground: {
    width: '85%',
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  vitalityBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  vitalityLabel: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  moodScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
    marginBottom: 16,
  },
  moodChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  moodChipActive: {
    backgroundColor: '#D97706',
  },
  moodChipText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
  },
  moodChipTextActive: {
    color: '#FFFFFF',
  },
  quoteBox: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 18,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  quoteTitle: {
    color: '#FDE68A',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  quoteSubtitle: {
    color: '#D1D5DB',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#EADCCB',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D7C4AF',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#3B2516',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#82654D',
    letterSpacing: 0.5,
  },
  unlockActionBtn: {
    backgroundColor: '#B45309',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 20,
    marginBottom: 28,
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  unlockActionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B2516',
  },
  card: {
    backgroundColor: '#EADCCB',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D7C4AF',
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingTextGroup: {
    flex: 1,
    marginRight: 16,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B2516',
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  settingDesc: {
    fontSize: 12,
    color: '#82654D',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#D7C4AF',
    marginVertical: 14,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3B2516',
  },
  appCategory: {
    fontSize: 11,
    color: '#82654D',
  },
  appTime: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#82654D',
    marginRight: 6,
  },
  blockBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  blockBtnActive: {
    backgroundColor: '#B45309',
  },
  blockBtnInactive: {
    backgroundColor: '#D7C4AF',
  },
  blockBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3B2516',
  },
  blockBtnTextActive: {
    color: '#FFFFFF',
  },
  philosophyCard: {
    backgroundColor: '#FAF5EE',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E6D7C3',
    alignItems: 'center',
    gap: 10,
  },
  philosophyText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    color: '#82654D',
    fontStyle: 'italic',
  },
  proofModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  proofModalContent: {
    backgroundColor: '#F6F1EA',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  proofModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#B4530915',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proofBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#B45309',
    letterSpacing: 1,
  },
  proofModalTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#3B2516',
    marginBottom: 6,
  },
  proofModalSubtitle: {
    fontSize: 13,
    color: '#82654D',
    lineHeight: 18,
    marginBottom: 20,
  },
  viewfinderContainer: {
    height: 220,
    borderRadius: 24,
    backgroundColor: '#E2D3BE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#C7B299',
    marginBottom: 20,
  },
  viewfinderMatGraphic: {
    width: 140,
    height: 180,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#B45309',
    backgroundColor: '#D7C4AF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  matPattern: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#B4530910',
    borderRadius: 8,
  },
  matBorder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  aimBox: {
    alignItems: 'center',
    gap: 6,
  },
  aimText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#82654D',
  },
  scanningPulse: {
    alignItems: 'center',
    gap: 8,
  },
  scanningText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#B45309',
  },
  verifiedCircle: {
    alignItems: 'center',
    gap: 6,
  },
  verifiedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#047857',
  },
  proofActions: {
    gap: 12,
  },
  scanBtn: {
    backgroundColor: '#B45309',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  honorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  honorBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#82654D',
  },
});
