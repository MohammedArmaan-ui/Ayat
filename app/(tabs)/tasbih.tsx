import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, useColorScheme, Animated, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { RotateCcw, Plus, List, Trash2, X } from 'lucide-react-native';
import { Modal, ScrollView } from 'react-native';

import { Text } from '@/components/Themed';
import { Colors } from '../../src/theme/colors';
import { SettingsService, AppSettings } from '../../src/services/settingsService';

const { width } = Dimensions.get('window');

const DHIKR_PHRASES = [
  { id: 1, arabic: 'سُبْحَانَ ٱللَّٰهِ', english: 'SubhanAllah', target: 33 },
  { id: 2, arabic: 'ٱلْحَمْدُ لِلَّٰهِ', english: 'Alhamdulillah', target: 33 },
  { id: 3, arabic: 'ٱللَّٰهُ أَكْبَرُ', english: 'Allahu Akbar', target: 34 },
  { id: 4, arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ', english: 'La ilaha illallah', target: 100 },
  { id: 5, arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ', english: 'Astaghfirullah', target: 100 },
  { id: 6, arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', english: 'SubhanAllah wa bihamdihi', target: 100 },
];

export default function TasbihScreen() {
  const [count, setCount] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [isSelectModalVisible, setIsSelectModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  
  const systemColorScheme = useColorScheme() ?? 'light';
  const theme = settings ? (Colors as any)[settings.theme] : (Colors as any)[systemColorScheme];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await SettingsService.getSettings();
    setSettings(s);
  };

  const currentPhrase = DHIKR_PHRASES[phraseIndex];

  const handlePress = useCallback(() => {
    // Visual Feedback
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 50, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
    ]).start();

    // Haptic Feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setCount(prev => {
      const next = prev + 1;
      if (next >= currentPhrase.target) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Add to history
        setHistory(prevH => [
          { phrase: currentPhrase.english, date: new Date().toLocaleTimeString(), count: currentPhrase.target },
          ...prevH.slice(0, 9) // Keep last 10
        ]);

        // Move to next phrase if finished
        if (phraseIndex < DHIKR_PHRASES.length - 1) {
          setPhraseIndex(phraseIndex + 1);
        } else {
          setPhraseIndex(0);
        }
        return 0;
      }
      return next;
    });
    setTotalCount(prev => prev + 1);
  }, [phraseIndex, currentPhrase]);

  const resetCount = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setCount(0);
    setPhraseIndex(0);
    setTotalCount(0);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>Total Sessions</Text>
          <Text style={[styles.statsValue, { color: theme.primary }]}>{totalCount}</Text>
        </View>
        <TouchableOpacity onPress={resetCount} style={[styles.resetButton, { backgroundColor: theme.surface }]}>
          <RotateCcw size={20} color={theme.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.phraseContainer}>
          <Text style={[styles.arabicPhrase, { color: theme.text }]}>{currentPhrase.arabic}</Text>
          <Text style={[styles.englishPhrase, { color: theme.primary }]}>{currentPhrase.english}</Text>
        </View>

        <TouchableOpacity 
          activeOpacity={1} 
          onPress={handlePress}
          style={styles.counterWrapper}
        >
          <Animated.View style={[
            styles.counterCircle, 
            { 
              backgroundColor: theme.surface, 
              borderColor: theme.primary,
              transform: [{ scale: scaleAnim }]
            }
          ]}>
            <View style={[styles.innerCircle, { borderColor: theme.border }]}>
              <Text style={[styles.countText, { color: theme.text }]}>{count}</Text>
              <Text style={[styles.targetText, { color: theme.textSecondary }]}>/ {currentPhrase.target}</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          {DHIKR_PHRASES.map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.progressDot, 
                { 
                  backgroundColor: i === phraseIndex ? theme.primary : theme.border,
                  width: i === phraseIndex ? 24 : 8
                }
              ]} 
            />
          ))}
        </View>

        <Text style={[styles.hintText, { color: theme.textSecondary }]}>Tap anywhere in the circle to count</Text>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <TouchableOpacity style={styles.footerAction} onPress={() => setIsHistoryModalVisible(true)}>
          <List size={24} color={theme.primary} />
          <Text style={[styles.footerText, { color: theme.primary }]}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerAction} onPress={() => setIsSelectModalVisible(true)}>
          <Plus size={24} color={theme.primary} />
          <Text style={[styles.footerText, { color: theme.primary }]}>Select</Text>
        </TouchableOpacity>
      </View>

      {/* Select Phrase Modal */}
      <Modal visible={isSelectModalVisible} animationType="slide" transparent>
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsSelectModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Dhikr</Text>
              <TouchableOpacity onPress={() => setIsSelectModalVisible(false)}>
                <X size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {DHIKR_PHRASES.map((p, index) => (
                <TouchableOpacity 
                  key={p.id} 
                  style={[styles.phraseItem, { borderBottomColor: theme.border }]}
                  onPress={() => {
                    setPhraseIndex(index);
                    setCount(0);
                    setIsSelectModalVisible(false);
                    Haptics.selectionAsync();
                  }}
                >
                  <View>
                    <Text style={[styles.itemArabic, { color: theme.text }]}>{p.arabic}</Text>
                    <Text style={[styles.itemEnglish, { color: theme.textSecondary }]}>{p.english}</Text>
                  </View>
                  <Text style={[styles.itemTarget, { color: theme.primary }]}>{p.target}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* History Modal */}
      <Modal visible={isHistoryModalVisible} animationType="slide" transparent>
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsHistoryModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Session History</Text>
              <TouchableOpacity onPress={() => setHistory([])}>
                <Trash2 size={20} color={theme.error} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsHistoryModalVisible(false)} style={{ marginLeft: 16 }}>
                <X size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {history.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No history yet</Text>
              ) : (
                history.map((h, i) => (
                  <View key={i} style={[styles.historyItem, { borderBottomColor: theme.border }]}>
                    <View>
                      <Text style={[styles.historyPhrase, { color: theme.text }]}>{h.phrase}</Text>
                      <Text style={[styles.historyDate, { color: theme.textSecondary }]}>{h.date}</Text>
                    </View>
                    <Text style={[styles.historyCount, { color: theme.primary }]}>+{h.count}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  statsContainer: {
    flex: 1,
  },
  statsLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resetButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  phraseContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  arabicPhrase: {
    fontSize: 42,
    fontFamily: 'System',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  englishPhrase: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  counterWrapper: {
    width: width * 0.65,
    height: width * 0.65,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  counterCircle: {
    width: '100%',
    height: '100%',
    borderRadius: (width * 0.65) / 2,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  innerCircle: {
    width: '90%',
    height: '90%',
    borderRadius: (width * 0.65 * 0.9) / 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  targetText: {
    fontSize: 18,
    marginTop: -8,
  },
  progressContainer: {
    flexDirection: 'row',
    marginTop: 40,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  hintText: {
    marginTop: 24,
    fontSize: 14,
    opacity: 0.8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 24,
    borderTopWidth: 1,
  },
  footerAction: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  modalScroll: {
    marginBottom: 20,
  },
  phraseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  itemArabic: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemEnglish: {
    fontSize: 14,
  },
  itemTarget: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  historyPhrase: {
    fontSize: 16,
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 12,
  },
  historyCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 40,
    fontSize: 16,
  },
});
