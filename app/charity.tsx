import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  Modal,
  Dimensions,
  Share,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  HeartHandshake,
  Droplets,
  Users,
  Utensils,
  ShieldAlert,
  Building,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Share2,
  Search,
  X,
  Receipt,
  Heart,
  Info,
  Check,
  Wallet,
} from 'lucide-react-native';

import { Text } from '@/components/Themed';
import { Colors } from '../src/theme/colors';
import { SettingsService, AppSettings } from '../src/services/settingsService';
import { AuthService } from '../src/services/authService';
import {
  CharityService,
  DonationRecord,
} from '../src/services/charityService';
import {
  CHARITY_CAUSES,
  CHARITY_CATEGORIES,
  CharityCause,
} from '../src/constants/charityCausesData';

const { width } = Dimensions.get('window');

export default function CharityScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'causes' | 'history'>('causes');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Donation state
  const [selectedCause, setSelectedCause] = useState<CharityCause | null>(null);
  const [donationModalVisible, setDonationModalVisible] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorNote, setDonorNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'direct'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Receipt Modal
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<{
    txId: string;
    causeTitle: string;
    amount: number;
    currency: string;
    date: string;
    donorName: string;
    note?: string;
  } | null>(null);

  // Stats & History
  const [summary, setSummary] = useState({ totalAmount: 0, totalCount: 0, causesCount: 0 });
  const [donations, setDonations] = useState<DonationRecord[]>([]);

  const systemColorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const theme = settings ? (Colors as any)[settings.theme] : (Colors as any)[systemColorScheme];
  const userCurrency = settings?.currency || 'USD';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const s = await SettingsService.getSettings();
    setSettings(s);
    if (s.userName) setUserName(s.userName);

    const user = await AuthService.getFirstUser().catch(() => null);
    if (user) {
      if (user.name) setUserName(user.name);
      if (user.email) setUserEmail(user.email);
    }

    await refreshStats();
  };

  const refreshStats = async () => {
    const sum = await CharityService.getSummary();
    setSummary(sum);
    const list = await CharityService.getDonations();
    setDonations(list);
  };

  // Filtered Causes
  const filteredCauses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return CHARITY_CAUSES.filter((cause) => {
      const matchesCategory =
        selectedCategory === 'all' || cause.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!query) return true;
      return (
        cause.title.toLowerCase().includes(query) ||
        cause.subtitle.toLowerCase().includes(query) ||
        cause.categoryLabel.toLowerCase().includes(query) ||
        cause.description.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, selectedCategory]);

  const openDonationModal = (cause: CharityCause) => {
    setSelectedCause(cause);
    setSelectedAmount(cause.suggestedAmounts[1] || 50);
    setCustomAmount('');
    setDonorNote('');
    setIsAnonymous(false);
    setDonationModalVisible(true);
  };

  const handleConfirmDonation = async () => {
    if (!selectedCause) return;

    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid donation amount.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await CharityService.recordDonation({
        causeId: selectedCause.id,
        causeTitle: selectedCause.title,
        amount: finalAmount,
        currency: userCurrency,
        isAnonymous: isAnonymous,
        donorName: isAnonymous ? 'Anonymous Donor' : (userName || 'Servant of Allah'),
        donorEmail: isAnonymous ? '' : userEmail,
        note: donorNote.trim(),
      });

      if (res.success && res.transactionId) {
        setDonationModalVisible(false);
        setLastReceipt({
          txId: res.transactionId,
          causeTitle: selectedCause.title,
          amount: finalAmount,
          currency: userCurrency,
          date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          donorName: isAnonymous ? 'Anonymous Donor' : (userName || 'Servant of Allah'),
          note: donorNote.trim(),
        });
        setSuccessModalVisible(true);
        await refreshStats();
      } else {
        Alert.alert('Donation Error', res.error || 'Failed to record donation.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareReceipt = async () => {
    if (!lastReceipt) return;
    try {
      await Share.share({
        title: 'Ayat Charity Receipt',
        message: `🌙 Alhamdulillah! I donated ${lastReceipt.amount} ${lastReceipt.currency} to "${lastReceipt.causeTitle}" via Ayat App.\n\nTransaction ID: ${lastReceipt.txId}\n"Charity does not decrease wealth." - Sahih Muslim\n\nGive charity today: https://ayat.app`,
      });
    } catch {}
  };

  const renderCauseIcon = (name: string, color: string) => {
    switch (name) {
      case 'Droplets':
        return <Droplets size={24} color={color} />;
      case 'Users':
        return <Users size={24} color={color} />;
      case 'Utensils':
        return <Utensils size={24} color={color} />;
      case 'ShieldAlert':
        return <ShieldAlert size={24} color={color} />;
      case 'Building':
        return <Building size={24} color={color} />;
      default:
        return <Sparkles size={24} color={color} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={[styles.headerBar, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.surface }]}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.screenTitle, { color: theme.text }]}>Charity & Sadaqah</Text>
          <Text style={[styles.arabicSubtitle, { color: theme.primary }]}>الصدقة والبرهان</Text>
        </View>
        <TouchableOpacity
          style={[styles.historyBtn, { backgroundColor: theme.primary + '15' }]}
          onPress={() => setActiveTab(activeTab === 'causes' ? 'history' : 'causes')}
        >
          <Receipt size={18} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Impact Banner Card */}
        <View style={[styles.impactCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.impactTopRow}>
            <View>
              <Text style={[styles.impactLabel, { color: theme.textSecondary }]}>Your Total Giving</Text>
              <Text style={[styles.impactValue, { color: theme.primary }]}>
                {summary.totalAmount > 0 ? `${summary.totalAmount.toLocaleString()} ${userCurrency}` : `0.00 ${userCurrency}`}
              </Text>
            </View>
            <View style={[styles.impactIconBadge, { backgroundColor: theme.primary + '15' }]}>
              <HeartHandshake size={28} color={theme.primary} />
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: theme.background }]}>
              <Text style={[styles.statNum, { color: theme.text }]}>{summary.totalCount}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Donations</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.background }]}>
              <Text style={[styles.statNum, { color: theme.text }]}>{summary.causesCount}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Causes Supported</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.background }]}>
              <Text style={[styles.statNum, { color: '#10B981' }]}>100%</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Verified Aid</Text>
            </View>
          </View>

          <View style={[styles.hadithBanner, { backgroundColor: theme.primary + '08' }]}>
            <Text style={[styles.hadithText, { color: theme.text }]}>
              "Charity extinguishes sins as water extinguishes fire."
            </Text>
            <Text style={[styles.hadithSource, { color: theme.primary }]}>— Sunan al-Tirmidhi</Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={[styles.tabContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'causes' && { backgroundColor: theme.primary },
            ]}
            onPress={() => setActiveTab('causes')}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'causes' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Explore Causes ({CHARITY_CAUSES.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'history' && { backgroundColor: theme.primary },
            ]}
            onPress={() => setActiveTab('history')}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'history' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              My Giving History ({donations.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Causes View */}
        {activeTab === 'causes' ? (
          <>
            {/* Search Input */}
            <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Search size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search causes, emergency relief, water..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={16} color={theme.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Category Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {CHARITY_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isActive ? theme.primary : theme.surface,
                        borderColor: isActive ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        { color: isActive ? '#FFFFFF' : theme.textSecondary },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Causes Cards */}
            <View style={styles.causesList}>
              {filteredCauses.map((cause) => {
                const progressPct = Math.min(
                  100,
                  Math.round((cause.raisedAmount / cause.targetAmount) * 100)
                );

                return (
                  <View
                    key={cause.id}
                    style={[
                      styles.causeCard,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                  >
                    {/* Top Row: Category & Urgent Badge */}
                    <View style={styles.causeCardHeader}>
                      <View style={styles.causeCategoryBadge}>
                        <Text style={[styles.causeCategoryText, { color: theme.primary }]}>
                          {cause.categoryLabel}
                        </Text>
                      </View>
                      {cause.isUrgent && (
                        <View style={styles.urgentBadge}>
                          <Text style={styles.urgentText}>URGENT</Text>
                        </View>
                      )}
                    </View>

                    {/* Icon & Title */}
                    <View style={styles.causeMainRow}>
                      <View
                        style={[
                          styles.causeIconWrap,
                          {
                            backgroundColor: cause.isUrgent
                              ? '#EF444415'
                              : theme.primary + '15',
                          },
                        ]}
                      >
                        {renderCauseIcon(
                          cause.iconName,
                          cause.isUrgent ? '#EF4444' : theme.primary
                        )}
                      </View>
                      <View style={styles.causeTitleWrap}>
                        <Text style={[styles.causeTitle, { color: theme.text }]}>
                          {cause.title}
                        </Text>
                        <Text
                          style={[styles.causeSubtitle, { color: theme.textSecondary }]}
                        >
                          {cause.subtitle}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.causeDesc, { color: theme.textSecondary }]}>
                      {cause.description}
                    </Text>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                      <View
                        style={[
                          styles.progressBarBg,
                          { backgroundColor: theme.border + '60' },
                        ]}
                      >
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              backgroundColor: cause.isUrgent ? '#EF4444' : theme.primary,
                              width: `${progressPct}%`,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.progressMeta}>
                        <Text style={[styles.progressRaised, { color: theme.text }]}>
                          ${cause.raisedAmount.toLocaleString()}{' '}
                          <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                            raised of ${cause.targetAmount.toLocaleString()}
                          </Text>
                        </Text>
                        <Text
                          style={[
                            styles.progressPercent,
                            { color: cause.isUrgent ? '#EF4444' : theme.primary },
                          ]}
                        >
                          {progressPct}%
                        </Text>
                      </View>
                    </View>

                    {/* Hadith Quote Box */}
                    <View style={[styles.cardHadith, { backgroundColor: theme.background }]}>
                      <Text style={[styles.cardHadithText, { color: theme.text }]}>
                        {cause.hadithQuote}
                      </Text>
                      <Text style={[styles.cardHadithSource, { color: theme.textSecondary }]}>
                        — {cause.hadithSource}
                      </Text>
                    </View>

                    {/* Partner & Donate Action */}
                    <View style={styles.cardBottomRow}>
                      <View style={styles.partnerInfo}>
                        <CheckCircle2 size={13} color="#10B981" />
                        <Text
                          style={[styles.partnerText, { color: theme.textSecondary }]}
                          numberOfLines={1}
                        >
                          {cause.verifiedPartner}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.donateBtn,
                          {
                            backgroundColor: cause.isUrgent ? '#EF4444' : theme.primary,
                          },
                        ]}
                        onPress={() => openDonationModal(cause)}
                      >
                        <Heart size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.donateBtnText}>Donate Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          /* My History View */
          <View style={styles.historyList}>
            {donations.length === 0 ? (
              <View style={[styles.emptyHistory, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <HeartHandshake size={48} color={theme.textSecondary} style={{ marginBottom: 16 }} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No Donations Yet</Text>
                <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
                  Your charity history and Sadaqah Jariyah records will appear here once you contribute to a cause.
                </Text>
                <TouchableOpacity
                  style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
                  onPress={() => setActiveTab('causes')}
                >
                  <Text style={styles.emptyBtnText}>Explore Causes</Text>
                </TouchableOpacity>
              </View>
            ) : (
              donations.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.historyCard,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                >
                  <View style={styles.historyCardHeader}>
                    <View>
                      <Text style={[styles.historyCauseTitle, { color: theme.text }]}>
                        {item.cause_title}
                      </Text>
                      <Text style={[styles.historyDate, { color: theme.textSecondary }]}>
                        {new Date(item.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <Text style={[styles.historyAmount, { color: theme.primary }]}>
                      +{item.amount.toLocaleString()} {item.currency}
                    </Text>
                  </View>

                  <View style={styles.historyMetaRow}>
                    <View style={styles.historyBadge}>
                      <Text style={[styles.historyBadgeText, { color: theme.textSecondary }]}>
                        Ref: {item.transaction_id}
                      </Text>
                    </View>
                    <Text style={[styles.donorNameTag, { color: theme.textSecondary }]}>
                      {item.donor_name}
                    </Text>
                  </View>

                  {item.note ? (
                    <Text style={[styles.historyNote, { color: theme.textSecondary }]}>
                      "{item.note}"
                    </Text>
                  ) : null}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Interactive Donation Modal */}
      <Modal
        visible={donationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDonationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Give Sadaqah</Text>
                <Text
                  style={[styles.modalSubtitle, { color: theme.textSecondary }]}
                  numberOfLines={1}
                >
                  {selectedCause?.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setDonationModalVisible(false)}
                style={[styles.modalCloseBtn, { backgroundColor: theme.border + '40' }]}
              >
                <X size={18} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Amount Selection */}
              <Text style={[styles.fieldLabel, { color: theme.text }]}>Select Amount ({userCurrency})</Text>
              <View style={styles.presetAmountsGrid}>
                {selectedCause?.suggestedAmounts.map((amt) => {
                  const isSelected = selectedAmount === amt && !customAmount;
                  return (
                    <TouchableOpacity
                      key={amt}
                      style={[
                        styles.presetPill,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.background,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                    >
                      <Text
                        style={[
                          styles.presetPillText,
                          { color: isSelected ? '#FFFFFF' : theme.text },
                        ]}
                      >
                        {amt} {userCurrency}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Amount */}
              <View
                style={[
                  styles.customInputWrap,
                  { backgroundColor: theme.background, borderColor: customAmount ? theme.primary : theme.border },
                ]}
              >
                <Text style={[styles.customCurrency, { color: theme.textSecondary }]}>
                  {userCurrency}
                </Text>
                <TextInput
                  style={[styles.customInput, { color: theme.text }]}
                  placeholder="Or enter custom amount"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={customAmount}
                  onChangeText={(val) => {
                    setCustomAmount(val);
                  }}
                />
              </View>

              {/* Anonymous Donation Toggle */}
              <TouchableOpacity
                style={[styles.anonToggle, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => setIsAnonymous(!isAnonymous)}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: isAnonymous ? theme.primary : 'transparent',
                      borderColor: isAnonymous ? theme.primary : theme.border,
                    },
                  ]}
                >
                  {isAnonymous && <Check size={14} color="#FFFFFF" />}
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.anonLabel, { color: theme.text }]}>Donate Anonymously</Text>
                  <Text style={[styles.anonDesc, { color: theme.textSecondary }]}>
                    Keep your name hidden from public lists
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Du'a / Intention Note */}
              <Text style={[styles.fieldLabel, { color: theme.text, marginTop: 14 }]}>
                Intention / Du'a Note (Optional)
              </Text>
              <TextInput
                style={[
                  styles.noteInput,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="e.g. In memory of my parents, for health & forgiveness..."
                placeholderTextColor={theme.textSecondary}
                value={donorNote}
                onChangeText={setDonorNote}
                multiline
                numberOfLines={2}
              />

              {/* Payment Method Selector */}
              <Text style={[styles.fieldLabel, { color: theme.text, marginTop: 14 }]}>
                Payment Method
              </Text>
              <View style={styles.paymentMethodsRow}>
                <TouchableOpacity
                  style={[
                    styles.paymentMethodCard,
                    {
                      backgroundColor: paymentMethod === 'card' ? theme.primary + '15' : theme.background,
                      borderColor: paymentMethod === 'card' ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setPaymentMethod('card')}
                >
                  <Wallet size={18} color={paymentMethod === 'card' ? theme.primary : theme.textSecondary} />
                  <Text
                    style={[
                      styles.paymentMethodText,
                      { color: paymentMethod === 'card' ? theme.primary : theme.text },
                    ]}
                  >
                    Card (Direct)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentMethodCard,
                    {
                      backgroundColor: paymentMethod === 'wallet' ? theme.primary + '15' : theme.background,
                      borderColor: paymentMethod === 'wallet' ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setPaymentMethod('wallet')}
                >
                  <Sparkles size={18} color={paymentMethod === 'wallet' ? theme.primary : theme.textSecondary} />
                  <Text
                    style={[
                      styles.paymentMethodText,
                      { color: paymentMethod === 'wallet' ? theme.primary : theme.text },
                    ]}
                  >
                    Pay / Wallet
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Submit CTA */}
              <TouchableOpacity
                style={[
                  styles.submitDonationBtn,
                  { backgroundColor: theme.primary, opacity: isSubmitting ? 0.7 : 1 },
                ]}
                onPress={handleConfirmDonation}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <HeartHandshake size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.submitDonationBtnText}>
                      Give {customAmount ? customAmount : selectedAmount} {userCurrency} Sadaqah
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Receipt Modal */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.receiptCard, { backgroundColor: theme.surface }]}>
            <View style={styles.receiptTop}>
              <View style={[styles.receiptIconCircle, { backgroundColor: '#10B98120' }]}>
                <CheckCircle2 size={44} color="#10B981" />
              </View>
              <Text style={[styles.receiptHeading, { color: theme.text }]}>Jazakum Allahu Khayran!</Text>
              <Text style={[styles.receiptSubheading, { color: theme.textSecondary }]}>
                May Allah accept your charity and bless your wealth.
              </Text>
            </View>

            <View style={[styles.receiptDetailsBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptRowLabel, { color: theme.textSecondary }]}>Transaction Ref</Text>
                <Text style={[styles.receiptRowVal, { color: theme.primary, fontWeight: 'bold' }]}>
                  {lastReceipt?.txId}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptRowLabel, { color: theme.textSecondary }]}>Cause</Text>
                <Text style={[styles.receiptRowVal, { color: theme.text }]} numberOfLines={1}>
                  {lastReceipt?.causeTitle}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptRowLabel, { color: theme.textSecondary }]}>Amount</Text>
                <Text style={[styles.receiptRowVal, { color: '#10B981', fontWeight: 'bold' }]}>
                  {lastReceipt?.amount} {lastReceipt?.currency}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptRowLabel, { color: theme.textSecondary }]}>Date</Text>
                <Text style={[styles.receiptRowVal, { color: theme.text }]}>{lastReceipt?.date}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptRowLabel, { color: theme.textSecondary }]}>Donor</Text>
                <Text style={[styles.receiptRowVal, { color: theme.text }]}>{lastReceipt?.donorName}</Text>
              </View>
            </View>

            <View style={[styles.receiptHadithBox, { backgroundColor: theme.primary + '08' }]}>
              <Text style={[styles.receiptHadithText, { color: theme.text }]}>
                "Charity does not decrease wealth."
              </Text>
              <Text style={[styles.receiptHadithSource, { color: theme.primary }]}>— Sahih Muslim</Text>
            </View>

            <View style={styles.receiptActions}>
              <TouchableOpacity
                style={[styles.receiptShareBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={handleShareReceipt}
              >
                <Share2 size={16} color={theme.text} style={{ marginRight: 6 }} />
                <Text style={[styles.receiptShareText, { color: theme.text }]}>Share Receipt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.receiptDoneBtn, { backgroundColor: theme.primary }]}
                onPress={() => setSuccessModalVisible(false)}
              >
                <Text style={styles.receiptDoneText}>Done</Text>
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  arabicSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  historyBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  impactCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  impactTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  impactLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  impactValue: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  impactIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  hadithBanner: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  hadithText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
  },
  hadithSource: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  causesList: {
    gap: 16,
  },
  causeCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  causeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  causeCategoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#05966915',
  },
  causeCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  urgentBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  causeMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  causeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  causeTitleWrap: {
    flex: 1,
  },
  causeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  causeSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  causeDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressRaised: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardHadith: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  cardHadithText: {
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  cardHadithSource: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'right',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 10,
  },
  partnerText: {
    fontSize: 11,
    fontWeight: '500',
  },
  donateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  donateBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  historyList: {
    gap: 12,
  },
  emptyHistory: {
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  historyCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyCauseTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    maxWidth: width * 0.55,
  },
  historyDate: {
    fontSize: 11,
    marginTop: 2,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  historyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#00000008',
  },
  historyBadgeText: {
    fontSize: 10,
    fontFamily: 'SpaceMono',
  },
  donorNameTag: {
    fontSize: 11,
  },
  historyNote: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#00000010',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  presetAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  presetPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  presetPillText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  customInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  customCurrency: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  customInput: {
    flex: 1,
    fontSize: 14,
  },
  anonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  anonLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  anonDesc: {
    fontSize: 11,
  },
  noteInput: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 13,
    textAlignVertical: 'top',
    minHeight: 56,
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  paymentMethodCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitDonationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  submitDonationBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  receiptCard: {
    margin: 24,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    alignSelf: 'center',
    width: width - 48,
  },
  receiptTop: {
    alignItems: 'center',
    marginBottom: 16,
  },
  receiptIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  receiptHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  receiptSubheading: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  receiptDetailsBox: {
    width: '100%',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    marginBottom: 14,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptRowLabel: {
    fontSize: 12,
  },
  receiptRowVal: {
    fontSize: 12,
    maxWidth: '65%',
    textAlign: 'right',
  },
  receiptHadithBox: {
    width: '100%',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 18,
  },
  receiptHadithText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  receiptHadithSource: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  receiptActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  receiptShareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  receiptShareText: {
    fontSize: 13,
    fontWeight: '600',
  },
  receiptDoneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  receiptDoneText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
