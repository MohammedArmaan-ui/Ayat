import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, useColorScheme, TextInput, Animated, Dimensions } from 'react-native';
import { Calculator, Wallet, Coins, TrendingUp, Info, ChevronRight, Check } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Text } from '@/components/Themed';
import { Colors } from '../../src/theme/colors';
import { SettingsService, AppSettings } from '../../src/services/settingsService';
import { ZakatService } from '../../src/services/zakatService';

const { width } = Dimensions.get('window');

export default function ZakatScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [savings, setSavings] = useState('');
  const [result, setResult] = useState<any>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const systemColorScheme = useColorScheme() ?? 'light';
  const theme = settings ? (Colors as any)[settings.theme] : (Colors as any)[systemColorScheme];

  useEffect(() => {
    loadSettings();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadSettings = async () => {
    const s = await SettingsService.getSettings();
    setSettings(s);
  };

  const handleCalculate = () => {
    const numericSavings = parseFloat(savings) || 0;
    
    const numericAssets = {
      cash: 0,
      savings: numericSavings,
      gold: 0,
      silver: 0,
      investments: 0,
      businessAssets: 0,
      liabilities: 0,
    };

    const calc = ZakatService.calculateZakat(numericAssets);
    setResult(calc);
  };

  const InputField = ({ label, value, onChange, icon: Icon, placeholder }: any) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{label}</Text>
      <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Icon size={18} color={theme.primary} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary + '80'}
          keyboardType="decimal-pad"
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
            <Calculator size={40} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Zakat Calculator</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Calculate your obligatory charity with precision and ease.
          </Text>
        </Animated.View>

        <View style={styles.formCard}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Savings</Text>
          <InputField 
            label="1 Year Bank Savings" 
            value={savings} 
            onChange={(v: string) => setSavings(v)}
            icon={Wallet}
            placeholder="Enter total savings"
          />

          <TouchableOpacity 
            style={[styles.calculateButton, { backgroundColor: theme.primary }]}
            onPress={handleCalculate}
          >
            <Text style={styles.calculateButtonText}>Calculate Zakat</Text>
          </TouchableOpacity>
        </View>

        {result && (
          <View style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
            <View style={styles.resultHeader}>
              <Text style={[styles.resultTitle, { color: theme.text }]}>Calculation Summary</Text>
              {result.nisabMet ? (
                <View style={[styles.statusBadge, { backgroundColor: theme.primary + '20' }]}>
                  <Check size={14} color={theme.primary} />
                  <Text style={[styles.statusText, { color: theme.primary }]}>Nisab Met</Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, { backgroundColor: theme.error + '20' }]}>
                  <Text style={[styles.statusText, { color: theme.error }]}>Below Nisab</Text>
                </View>
              )}
            </View>

            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: theme.textSecondary }]}>Net Wealth</Text>
              <Text style={[styles.resultValue, { color: theme.text }]}>${result.totalWealth.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
            </View>
            
            <View style={[styles.divider, { marginVertical: 12 }]} />
            
            <View style={styles.resultRow}>
              <Text style={[styles.zakatLabel, { color: theme.text }]}>Zakat Due (2.5%)</Text>
              <Text style={[styles.zakatValue, { color: theme.primary }]}>${result.zakatDue.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
            </View>

            <Text style={[styles.resultNote, { color: theme.textSecondary }]}>
              {result.nisabMet 
                ? "Your wealth is above the Nisab threshold. Zakat is obligatory on this amount."
                : "Your wealth is currently below the Nisab threshold. Zakat is not obligatory."}
            </Text>
          </View>
        )}
        
        <View style={styles.infoSection}>
          <Info size={16} color={theme.textSecondary} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Zakat is calculated as 2.5% of your total savings, provided they have been held for one lunar year and exceed the Nisab threshold (~$6,500 based on current gold prices).
          </Text>
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
    paddingTop: 40,
    paddingBottom: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  formCard: {
    borderRadius: 24,
    padding: 4,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
    opacity: 0.5,
  },
  calculateButton: {
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  calculateButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultCard: {
    marginTop: 32,
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 15,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  zakatLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  zakatValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  resultNote: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoSection: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 10,
    paddingHorizontal: 12,
  },
  infoText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
});
