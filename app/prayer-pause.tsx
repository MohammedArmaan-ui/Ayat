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
  X,
  Check,
  AlertTriangle,
  Flame,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Text } from '@/components/Themed';
import { Colors } from '../src/theme/colors';
import { SettingsService, AppSettings } from '../src/services/settingsService';
import { PrayerService, PrayerData } from '../src/services/prayerService';
import {
  PrayerPauseService,
  UzzaMood,
  PrayerPauseSettings,
  SalahEvaluation,
  DEFAULT_PAUSE_SETTINGS,
} from '../src/services/prayerPauseService';
import { UzzaCat } from '../src/components/UzzaCat';

const { width } = Dimensions.get('window');

const MOODS: { key: UzzaMood; label: string; icon: string }[] = [
  { key: 'Thriving', label: 'Thriving', icon: '🌸' },
  { key: 'Content', label: 'Content', icon: '🌿' },
  { key: 'Peaceful', label: 'Peaceful', icon: '🌙' },
  { key: 'Reminding', label: 'Reminding', icon: '🥺' },
  { key: 'Sad', label: 'Sad', icon: '😿' },
  { key: 'Angry', label: 'Angry', icon: '⚡' },
];

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

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
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [trackedPrayers, setTrackedPrayers] = useState<Record<string, boolean>>({});
  const [apps, setApps] = useState<AppOffender[]>(DEFAULT_APPS);

  // Manual mood preview override (null = auto real-time Salah mode)
  const [previewMood, setPreviewMood] = useState<UzzaMood | null>(null);
  const [proofModalVisible, setProofModalVisible] = useState(false);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'verified'>('idle');

  const theme = settings ? (Colors as any)[settings.theme] : (Colors as any)[systemColorScheme];

  const todayDateString = () => {
    const today = new Date();
    return `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const s = await SettingsService.getSettings();
      setSettings(s);

      const ps = await PrayerPauseService.getSettings();
      setPauseSettings(ps);

      const pData = await PrayerService.getPrayerTimes(s.locationCity, s.locationCountry);
      if (pData) setPrayerData(pData);

      const dateStr = todayDateString();
      const tracked = await PrayerService.getTrackedPrayers(dateStr);
      setTrackedPrayers(tracked);
    } catch (e) {
      console.warn('[PrayerPause] Failed to load data:', e);
    }
  };

  // Live evaluation of user's Salah performance
  const liveEvaluation: SalahEvaluation = PrayerPauseService.evaluateSalahStatus(
    prayerData?.timings || null,
    trackedPrayers,
    new Date()
  );

  const activeMood: UzzaMood = previewMood || liveEvaluation.mood;
  const activeVitality = previewMood
    ? previewMood === 'Thriving' ? 100
      : previewMood === 'Content' ? 85
      : previewMood === 'Peaceful' ? 90
      : previewMood === 'Reminding' ? 55
      : previewMood === 'Sad' ? 32
      : 12
    : liveEvaluation.vitality;

  const quote = previewMood
    ? PrayerPauseService.getMoodQuote(previewMood)
    : { title: liveEvaluation.title, subtitle: liveEvaluation.subtitle };

  // Toggle prayer completion directly from inside Prayer Pause
  const handleTogglePrayer = async (prayerName: string) => {
    const isCompletedNow = !trackedPrayers[prayerName];
    Haptics.impactAsync(isCompletedNow ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);

    const updated = { ...trackedPrayers, [prayerName]: isCompletedNow };
    setTrackedPrayers(updated);

    const dateStr = todayDateString();
    await PrayerService.togglePrayer(dateStr, prayerName, isCompletedNow);

    // If was previewing, reset to live mode to see immediate reaction
    setPreviewMood(null);

    if (isCompletedNow) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

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

  const handleStartProofScan = () => {
    setScanState('scanning');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setTimeout(() => {
      setScanState('verified');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(async () => {
        setProofModalVisible(false);
        setScanState('idle');

        // Mark the current prayer or next unprayed prayer as completed
        const due = liveEvaluation.currentPrayerDue || liveEvaluation.missedPrayers[0] || 'Dhuhr';
        await handleTogglePrayer(due);
        Alert.alert(
          'Salah Verified! 🌙',
          `Your ${due} prayer has been logged. Uzza is revived and thriving!`
        );
      }, 1400);
    }, 2000);
  };

  const getVitalityColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#3B82F6';
    if (score >= 40) return '#F59E0B';
    if (score >= 20) return '#F97316';
    return '#EF4444';
  };

  const getPrayerTimeStr = (name: string) => {
    if (!prayerData?.timings) return '--:--';
    return (prayerData.timings as any)[name] || '--:--';
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F7F2EA' }]}>
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
            <Text style={[styles.navSubtitle, { color: '#82654D' }]}>
              {previewMood ? 'Preview Mode' : 'Live Salah Sync'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: '#EADCCB', borderColor: '#D7C4AF' }]}
            onPress={() => {
              setPreviewMood(null);
              loadData();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <RefreshCw size={18} color="#3B2516" />
          </TouchableOpacity>
        </View>

        {/* HERO CARD: UZZA THE CAT (Directly reflecting Salah) */}
        <View style={styles.heroCard}>
          <View style={styles.nameBadgeRow}>
            <Text style={styles.characterName}>UZZA</Text>
            {previewMood && (
              <TouchableOpacity
                style={styles.autoTagBtn}
                onPress={() => {
                  setPreviewMood(null);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={styles.autoTagText}>Reset to Live Salah ↺</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Kitten Graphic matching the user's provided character art */}
          <View style={styles.catWrapper}>
            <UzzaCat mood={activeMood} size={230} />
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
              {activeMood.toUpperCase()} SPIRITUAL VITALITY
            </Text>
          </View>

          {/* Dynamic Salah Motivation Quote Card */}
          <View style={[styles.quoteBox, { borderColor: liveEvaluation.themeColor + '40' }]}>
            <Text style={[styles.quoteTitle, { color: '#FDE68A' }]}>{quote.title}</Text>
            <Text style={styles.quoteSubtitle}>{quote.subtitle}</Text>
          </View>

          {/* Mood Selector Chips (Interactive preview of all 6 expressions) */}
          <View style={styles.moodSelectorHeader}>
            <Text style={styles.moodSelectorTitle}>Interactive Expression Sheet</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodScroll}
          >
            {MOODS.map(m => {
              const isSelected = activeMood === m.key;
              return (
                <TouchableOpacity
                  key={m.key}
                  style={[
                    styles.moodChip,
                    isSelected && styles.moodChipActive,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setPreviewMood(m.key);
                  }}
                >
                  <Text style={styles.moodChipEmoji}>{m.icon}</Text>
                  <Text style={[styles.moodChipText, isSelected && styles.moodChipTextActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* SALAH DISCIPLINE TRACKER: Direct Driver of Uzza's Emotion */}
        <View style={styles.sectionHeader}>
          <Clock size={18} color="#3B2516" />
          <Text style={styles.sectionTitle}>Today's Salah & Uzza's State</Text>
          <Text style={styles.sectionBadge}>
            {liveEvaluation.totalCompleted}/5 Done
          </Text>
        </View>

        <View style={styles.prayerListCard}>
          {PRAYER_NAMES.map((name, index) => {
            const isDone = !!trackedPrayers[name];
            const isDueNow = liveEvaluation.currentPrayerDue === name;
            const isMissed = liveEvaluation.missedPrayers.includes(name);

            return (
              <View key={name}>
                <TouchableOpacity
                  style={[
                    styles.prayerItemRow,
                    isDueNow && styles.prayerItemRowDue,
                    isMissed && styles.prayerItemRowMissed,
                  ]}
                  onPress={() => handleTogglePrayer(name)}
                  activeOpacity={0.75}
                >
                  <View style={styles.prayerLeft}>
                    <TouchableOpacity
                      style={[
                        styles.prayerCheckbox,
                        isDone && styles.prayerCheckboxDone,
                        isDueNow && !isDone && styles.prayerCheckboxDue,
                        isMissed && !isDone && styles.prayerCheckboxMissed,
                      ]}
                      onPress={() => handleTogglePrayer(name)}
                    >
                      {isDone ? (
                        <Check size={16} color="#FFFFFF" />
                      ) : isMissed ? (
                        <AlertTriangle size={14} color="#EF4444" />
                      ) : null}
                    </TouchableOpacity>

                    <View>
                      <View style={styles.prayerTitleRow}>
                        <Text style={[styles.prayerNameText, isDone && styles.prayerNameTextDone]}>
                          {name}
                        </Text>
                        {isDueNow && !isDone && (
                          <View style={styles.duePill}>
                            <Text style={styles.duePillText}>PRAY NOW</Text>
                          </View>
                        )}
                        {isMissed && !isDone && (
                          <View style={styles.missedPill}>
                            <Text style={styles.missedPillText}>MISSED</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.prayerTimeSub}>{getPrayerTimeStr(name)}</Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.prayerStatusLabel,
                      isDone
                        ? { color: '#047857' }
                        : isMissed
                        ? { color: '#EF4444' }
                        : isDueNow
                        ? { color: '#D97706' }
                        : { color: '#82654D' },
                    ]}
                  >
                    {isDone ? 'Completed ✓' : isMissed ? 'Needs Qada ⚠️' : isDueNow ? 'Window Open' : 'Upcoming'}
                  </Text>
                </TouchableOpacity>
                {index < PRAYER_NAMES.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
        </View>

        {/* PRAY TO UNLOCK ACTION */}
        <TouchableOpacity
          style={styles.unlockActionBtn}
          onPress={() => setProofModalVisible(true)}
          activeOpacity={0.85}
        >
          <Camera size={22} color="#FFFFFF" />
          <Text style={styles.unlockActionBtnText}>Pray to Unlock (Scan Mat / Honor)</Text>
        </TouchableOpacity>

        {/* FOCUS SCHEDULES & APP BLOCKING */}
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

        {/* TOP OFFENDERS / APP LIMITS */}
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
            "Uzza's emotion is a mirror of your heart's priority. When you hasten to Salah, she thrives with joy. When Salah is delayed or missed, she grieves. Protect your prayer, protect your peace."
          </Text>
        </View>
      </ScrollView>

      {/* PROOF MODE SCAN MODAL */}
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
                <Text style={styles.proofBadgeText}>PRAY TO UNLOCK</Text>
              </View>
              <TouchableOpacity onPress={() => setProofModalVisible(false)}>
                <X size={24} color="#3B2516" />
              </TouchableOpacity>
            </View>

            <Text style={styles.proofModalTitle}>Verify Your Salah</Text>
            <Text style={styles.proofModalSubtitle}>
              Scan your prayer spot / mat to unlock your apps and revive Uzza, or confirm on Honor Mode.
            </Text>

            {/* SCANNING VIEWFINDER */}
            <View style={styles.viewfinderContainer}>
              <View style={styles.viewfinderMatGraphic}>
                <View style={styles.matPattern} />
                <View style={styles.matBorder}>
                  {scanState === 'verified' ? (
                    <View style={styles.verifiedCircle}>
                      <CheckCircle2 size={48} color="#10B981" />
                      <Text style={styles.verifiedText}>Salah Verified & Accepted!</Text>
                    </View>
                  ) : scanState === 'scanning' ? (
                    <View style={styles.scanningPulse}>
                      <Clock size={36} color="#B45309" />
                      <Text style={styles.scanningText}>Detecting Prayer Mat...</Text>
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
                  {scanState === 'scanning' ? 'Verifying...' : 'Scan Prayer Mat to Unlock'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.honorBtn}
                onPress={async () => {
                  setProofModalVisible(false);
                  const due = liveEvaluation.currentPrayerDue || liveEvaluation.missedPrayers[0] || 'Dhuhr';
                  await handleTogglePrayer(due);
                }}
              >
                <Shield size={16} color="#82654D" />
                <Text style={styles.honorBtnText}>Honor Mode (I Have Prayed)</Text>
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
    marginBottom: 18,
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
    backgroundColor: '#2D231E',
    borderRadius: 32,
    padding: 22,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 6,
  },
  characterName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FDE68A',
    letterSpacing: 3,
  },
  autoTagBtn: {
    backgroundColor: 'rgba(253, 230, 138, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  autoTagText: {
    fontSize: 11,
    color: '#FDE68A',
    fontWeight: 'bold',
  },
  catWrapper: {
    marginVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vitalitySection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  vitalityPercentage: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
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
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  quoteBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 18,
    padding: 14,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  quoteTitle: {
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
  moodSelectorHeader: {
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  moodSelectorTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  moodScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  moodChipActive: {
    backgroundColor: '#D97706',
  },
  moodChipEmoji: {
    fontSize: 13,
  },
  moodChipText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
  },
  moodChipTextActive: {
    color: '#FFFFFF',
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
    flex: 1,
  },
  sectionBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#B45309',
    backgroundColor: '#B4530918',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  prayerListCard: {
    backgroundColor: '#EADCCB',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D7C4AF',
    marginBottom: 18,
  },
  prayerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  prayerItemRowDue: {
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
  },
  prayerItemRowMissed: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  prayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prayerCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#82654D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerCheckboxDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  prayerCheckboxDue: {
    borderColor: '#D97706',
    borderWidth: 2.5,
  },
  prayerCheckboxMissed: {
    borderColor: '#EF4444',
    borderWidth: 2.5,
  },
  prayerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prayerNameText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3B2516',
  },
  prayerNameTextDone: {
    color: '#047857',
  },
  duePill: {
    backgroundColor: '#D97706',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  duePillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  missedPill: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  missedPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  prayerTimeSub: {
    fontSize: 11,
    color: '#82654D',
    marginTop: 2,
  },
  prayerStatusLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  unlockActionBtn: {
    backgroundColor: '#B45309',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 20,
    marginBottom: 24,
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
    marginVertical: 10,
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
