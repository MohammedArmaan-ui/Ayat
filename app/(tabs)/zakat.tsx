import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, useColorScheme, TextInput, Animated, Dimensions, Modal, FlatList, ActivityIndicator } from 'react-native';
import { Calculator, Wallet, Info, ChevronRight, Check, Search, X, RefreshCw } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Text } from '@/components/Themed';
import { Colors } from '../../src/theme/colors';
import { SettingsService, AppSettings } from '../../src/services/settingsService';
import { ZakatService } from '../../src/services/zakatService';
import { CurrencyService } from '../../src/services/currencyService';
import { CURRENCIES } from '../../src/constants/currenciesData';

const { width } = Dimensions.get('window');

export default function ZakatScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [savings, setSavings] = useState('');
  const [result, setResult] = useState<any>(null);
  const [currency, setCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(1); // rate: 1 USD = X local
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
    const savedCurrency = s.currency ?? 'USD';
    setCurrency(savedCurrency);
    await fetchRate(savedCurrency);
  };

  const fetchRate = useCallback(async (currencyCode: string) => {
    setRateLoading(true);
    setRateError(false);
    try {
      const rate = await CurrencyService.getRate(currencyCode);
      setExchangeRate(rate);
    } catch {
      setRateError(true);
    } finally {
      setRateLoading(false);
    }
  }, []);

  const getSymbol = () => {
    const curr = CURRENCIES.find(c => c.code === currency);
    return curr ? curr.symbol : '$';
  };

  const getCurrencyName = () => {
    const curr = CURRENCIES.find(c => c.code === currency);
    return curr ? curr.name : 'US Dollar';
  };

  const filteredCurrencies = CURRENCIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCurrencyChange = async (newCurrency: string) => {
    setCurrency(newCurrency);
    setModalVisible(false);
    setSearchQuery('');
    setResult(null); // clear stale result
    await SettingsService.updateSetting('currency', newCurrency);
    await fetchRate(newCurrency);
  };

  // Nisab in local currency
  const nisabInLocal = ZakatService.getNisabValue('gold') * exchangeRate;

  const handleCalculate = () => {
    const numericSavingsLocal = parseFloat(savings) || 0;
    // Convert user input from local currency → USD for the calculation engine
    const numericSavingsUSD = numericSavingsLocal / exchangeRate;

    const numericAssets = {
      cash: 0,
      savings: numericSavingsUSD,
      gold: 0,
      silver: 0,
      investments: 0,
      businessAssets: 0,
      liabilities: 0,
    };

    const calcUSD = ZakatService.calculateZakat(numericAssets);

    // Convert results back to local currency for display
    setResult({
      ...calcUSD,
      totalWealth: calcUSD.totalWealth * exchangeRate,
      zakatDue: calcUSD.zakatDue * exchangeRate,
    });
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
          {/* Exchange rate badge */}
          <View style={[styles.rateBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {rateLoading ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : rateError ? (
              <TouchableOpacity style={styles.rateRow} onPress={() => fetchRate(currency)}>
                <RefreshCw size={13} color={theme.error} />
                <Text style={[styles.rateText, { color: theme.error }]}>Rate unavailable – tap to retry</Text>
              </TouchableOpacity>
            ) : currency === 'USD' ? (
              <Text style={[styles.rateText, { color: theme.textSecondary }]}>Base currency (USD)</Text>
            ) : (
              <Text style={[styles.rateText, { color: theme.textSecondary }]}>
                1 USD = {exchangeRate.toLocaleString(undefined, { maximumFractionDigits: 4 })} {currency}
              </Text>
            )}
          </View>
        </Animated.View>

        <View style={styles.formCard}>
          <View style={styles.currencyRow}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 0 }]}>Currency</Text>
            <TouchableOpacity 
              style={[styles.currencySelector, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={[styles.currencySelectorText, { color: theme.text }]}>{currency} ({getSymbol()})</Text>
              <ChevronRight size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <InputField 
            label={`1 Year Bank Savings in ${getCurrencyName()}`} 
            value={savings} 
            onChange={(v: string) => setSavings(v)}
            icon={Wallet}
            placeholder={`Amount in ${currency}`}
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
              <Text style={[styles.resultValue, { color: theme.text }]}>{getSymbol()}{result.totalWealth.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
            </View>
            
            <View style={[styles.divider, { marginVertical: 12 }]} />
            
            <View style={styles.resultRow}>
              <Text style={[styles.zakatLabel, { color: theme.text }]}>Zakat Due (2.5%)</Text>
              <Text style={[styles.zakatValue, { color: theme.primary }]}>{getSymbol()}{result.zakatDue.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
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
            Zakat is 2.5% of net savings held for one lunar year, once they exceed the Nisab threshold (~{getSymbol()}{nisabInLocal.toLocaleString(undefined, { maximumFractionDigits: 0 })} based on current gold prices).
          </Text>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={80} style={StyleSheet.absoluteFill} />
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Currency</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Search size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search currency..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <FlatList
              data={filteredCurrencies}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.currencyItem, { borderBottomColor: theme.border }]}
                  onPress={() => handleCurrencyChange(item.code)}
                >
                  <View style={styles.currencyInfo}>
                    <Text style={[styles.currencyCode, { color: theme.text }]}>{item.code}</Text>
                    <Text style={[styles.currencyName, { color: theme.textSecondary }]}>{item.name}</Text>
                  </View>
                  <Text style={[styles.currencySymbol, { color: theme.primary }]}>{item.symbol}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.modalList}
            />
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
    marginBottom: 12,
  },
  rateBadge: {
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  formCard: {
    borderRadius: 24,
    padding: 4,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  currencySelectorText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
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
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  modalList: {
    paddingBottom: 40,
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  currencyName: {
    fontSize: 12,
    marginTop: 2,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
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
