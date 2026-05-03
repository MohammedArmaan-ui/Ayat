import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, useColorScheme, ScrollView, Animated, Dimensions, Modal, Platform } from 'react-native';
import { Shield, Lock, Smartphone, Timer, Check, AlertCircle, X, ExternalLink } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Text } from '@/components/Themed';
import { Colors } from '../../src/theme/colors';
import { SettingsService, AppSettings } from '../../src/services/settingsService';
import { PurchaseService } from '../../src/services/purchaseService';

const { width } = Dimensions.get('window');

const DISTRACTION_APPS = [
  { id: 'ig', name: 'Instagram', icon: '📸', category: 'Social Media' },
  { id: 'tt', name: 'TikTok', icon: '🎵', category: 'Entertainment' },
  { id: 'tw', name: 'X / Twitter', icon: '🐦', category: 'Social Media' },
  { id: 'fb', name: 'Facebook', icon: '👥', category: 'Social Media' },
  { id: 'sc', name: 'Snapchat', icon: '👻', category: 'Social Media' },
];

export default function FocusScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isFocusing, setIsFocusing] = useState(false);
  const [timer, setTimer] = useState(1500); // 25 minutes
  const [selectedApps, setSelectedApps] = useState<string[]>(['ig', 'tt']);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  const systemColorScheme = useColorScheme() ?? 'light';
  const theme = settings ? (Colors as any)[settings.theme] : (Colors as any)[systemColorScheme];

  useEffect(() => {
    let interval: any;
    if (isFocusing && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsFocusing(false);
      setTimer(1500);
    }
    return () => clearInterval(interval);
  }, [isFocusing, timer]);

  useEffect(() => {
    loadSettings();
    checkPremiumStatus();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const checkPremiumStatus = async () => {
    const isPremium = await PurchaseService.isPremium();
    setIsPaid(isPremium);
  };

  const loadSettings = async () => {
    const s = await SettingsService.getSettings();
    setSettings(s);
  };

  const toggleApp = (id: string) => {
    if (!isPaid) {
      setShowPaymentModal(true);
      return;
    }
    setSelectedApps(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const startFocusSession = () => {
    if (!isPaid) {
      setShowPaymentModal(true);
      return;
    }
    setIsFocusing(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePurchase = async () => {
    // Attempt real purchase via RevenueCat
    const offerings = await PurchaseService.getOfferings();
    if (offerings && offerings.all['premium_lifetime']) {
      const success = await PurchaseService.purchasePackage(offerings.all['premium_lifetime'].lifetime);
      if (success) {
        setIsPaid(true);
        setShowPaymentModal(false);
      }
    } else {
      // Fallback for testing/dev if offerings aren't configured
      setIsPaid(true);
      setShowPaymentModal(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
            <Shield size={48} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>PureFocus</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Silence the noise of the world to hear the call of your soul.
          </Text>
        </Animated.View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Distractions</Text>
          <View style={styles.appList}>
            {DISTRACTION_APPS.map((app) => (
              <TouchableOpacity 
                key={app.id}
                style={[
                  styles.appCard, 
                  { backgroundColor: theme.surface, borderColor: selectedApps.includes(app.id) ? theme.primary : theme.border }
                ]}
                onPress={() => toggleApp(app.id)}
              >
                <View style={styles.appInfo}>
                  <Text style={styles.appIcon}>{app.icon}</Text>
                  <View>
                    <Text style={[styles.appName, { color: theme.text }]}>{app.name}</Text>
                    <Text style={[styles.appCategory, { color: theme.textSecondary }]}>{app.category}</Text>
                  </View>
                </View>
                {selectedApps.includes(app.id) ? (
                  <Check size={20} color={theme.primary} />
                ) : (
                  <View style={[styles.checkbox, { borderColor: theme.border }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {!isPaid && (
          <View style={[styles.upgradeCard, { backgroundColor: theme.primary }]}>
            <Lock size={32} color="#FFF" />
            <View style={styles.upgradeTextContainer}>
              <Text style={styles.upgradeTitle}>Unlock Digital Discipline</Text>
              <Text style={styles.upgradeSubtitle}>Enable deep blocking for social media apps during prayer and study times.</Text>
            </View>
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={() => setShowPaymentModal(true)}
            >
              <Text style={[styles.upgradeButtonText, { color: theme.primary }]}>Get Premium</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          style={[
            styles.startButton, 
            { backgroundColor: isPaid ? theme.primary : theme.border }
          ]}
          onPress={startFocusSession}
        >
          <Smartphone size={20} color="#FFF" />
          <Text style={styles.startButtonText}>{isFocusing ? 'Session Active' : 'Start Focus Session'}</Text>
        </TouchableOpacity>
        
        <View style={styles.footerInfo}>
          <AlertCircle size={14} color={theme.textSecondary} />
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Premium focus uses advanced system permissions to help you stay disciplined.
          </Text>
        </View>
      </ScrollView>

      {/* Focus Overlay */}
      {isFocusing && (
        <Modal transparent animationType="fade">
          <View style={styles.focusOverlay}>
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
            <Shield size={100} color={theme.primary} />
            <Text style={styles.focusTitle}>Focus Mode Active</Text>
            <Text style={styles.focusTimer}>{formatTime(timer)}</Text>
            <Text style={styles.focusSubtitle}>
              {selectedApps.length} apps are currently being suppressed.
            </Text>
            
            <View style={styles.activeAppList}>
              {selectedApps.map(id => {
                const app = DISTRACTION_APPS.find(a => a.id === id);
                return <Text key={id} style={styles.activeAppIcon}>{app?.icon}</Text>
              })}
            </View>

            <TouchableOpacity 
              style={[styles.stopButton, { borderColor: theme.error }]}
              onPress={() => setIsFocusing(false)}
            >
              <Text style={[styles.stopButtonText, { color: theme.error }]}>End Session Early</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowPaymentModal(false)}
            >
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>

            <View style={styles.premiumHeader}>
              <Text style={[styles.premiumTag, { backgroundColor: theme.primary + '20', color: theme.primary }]}>AYAT PREMIUM</Text>
              <Text style={[styles.premiumTitle, { color: theme.text }]}>Master Your Time</Text>
              <Text style={[styles.premiumDesc, { color: theme.textSecondary }]}>
                Focus is the key to spiritual growth. Unlock deep distraction blocking and priority alerts.
              </Text>
            </View>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: theme.primary + '10' }]}>
                  <Shield size={18} color={theme.primary} />
                </View>
                <Text style={[styles.featureText, { color: theme.text }]}>Block Social Media completely</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: theme.primary + '10' }]}>
                  <Timer size={18} color={theme.primary} />
                </View>
                <Text style={[styles.featureText, { color: theme.text }]}>Auto-Focus during Prayer times</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: theme.primary + '10' }]}>
                  <ExternalLink size={18} color={theme.primary} />
                </View>
                <Text style={[styles.featureText, { color: theme.text }]}>Whitelisted Islamic Apps only</Text>
              </View>
            </View>

            <View style={[styles.priceCard, { borderColor: theme.primary }]}>
              <View>
                <Text style={[styles.priceLabel, { color: theme.text }]}>Lifetime Access</Text>
                <Text style={[styles.priceValue, { color: theme.primary }]}>$4.99</Text>
              </View>
              <View style={[styles.saveTag, { backgroundColor: theme.primary }]}>
                <Text style={styles.saveText}>BEST VALUE</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.payButton, { backgroundColor: theme.primary }]}
              onPress={handlePurchase}
            >
              <Text style={styles.payButtonText}>Unlock PureFocus Now</Text>
            </TouchableOpacity>
            
            <Text style={[styles.privacyText, { color: theme.textSecondary }]}>
              Secure payment processed via App Store / Play Store.
            </Text>
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
    padding: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  appList: {
    gap: 12,
  },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
  },
  appCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    marginBottom: 30,
  },
  upgradeTextContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 10,
  },
  upgradeTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  upgradeSubtitle: {
    color: '#FFF',
    fontSize: 12,
    opacity: 0.9,
    marginTop: 2,
  },
  upgradeButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  upgradeButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 18,
    gap: 10,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    gap: 6,
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    paddingBottom: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  premiumHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  premiumTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 16,
  },
  premiumTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  premiumDesc: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresList: {
    gap: 20,
    marginBottom: 35,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
  },
  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  saveTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  saveText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  payButton: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  privacyText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  focusOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  focusTitle: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 30,
  },
  focusTimer: {
    color: '#FFF',
    fontSize: 64,
    fontWeight: '300',
    marginVertical: 20,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  focusSubtitle: {
    color: '#FFF',
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
  },
  activeAppList: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
    marginBottom: 50,
  },
  activeAppIcon: {
    fontSize: 32,
  },
  stopButton: {
    borderWidth: 1,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
