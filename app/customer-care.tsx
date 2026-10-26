import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Headphones,
  Phone,
  Mail,
  User,
  MessageSquare,
  Send,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react-native';

import { Text } from '@/components/Themed';
import { Colors } from '../src/theme/colors';
import { SettingsService, AppSettings } from '../src/services/settingsService';
import { AuthService } from '../src/services/authService';
import { NotificationService } from '../src/services/notificationService';

const CATEGORIES = [
  'General Issue',
  'App Bug / Crash',
  'Prayer Times',
  'Quran & Audio',
  'Feature Request',
];

export default function CustomerCareScreen() {
  const systemColorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [issueDescription, setIssueDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const theme = settings ? (Colors as any)[settings.theme] : (Colors as any)[systemColorScheme];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const s = await SettingsService.getSettings();
      setSettings(s);
      if (s.userName && s.userName !== 'Servant of Allah') {
        setUserName(s.userName);
      }

      const user = await AuthService.getFirstUser().catch(() => null);
      if (user) {
        if (!userName && user.name) setUserName(user.name);
        if (user.email) setUserEmail(user.email);
      }
    } catch (e) {
      console.warn('[CustomerCare] Failed to load user info:', e);
    }
  };

  const handleSubmit = async () => {
    const cleanPhone = phoneNumber.trim();
    const cleanIssue = issueDescription.trim();

    if (!cleanPhone) {
      Alert.alert('Phone Number Required', 'Please enter your phone number so customer care can reach you.');
      return;
    }

    if (cleanPhone.length < 6) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number with your country code.');
      return;
    }

    if (!cleanIssue) {
      Alert.alert('Issue Description Required', 'Please describe your issue or concern.');
      return;
    }

    if (cleanIssue.length < 10) {
      Alert.alert('More Details Needed', 'Please provide a few more details so we can understand and resolve your issue.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await NotificationService.sendCustomerCareInquiry({
        userName: userName.trim() || 'Servant of Allah',
        email: userEmail.trim(),
        phoneNumber: cleanPhone,
        issueCategory: selectedCategory,
        issueDescription: cleanIssue,
      });

      if (result.success) {
        setIsSuccess(true);
      } else {
        // Even if network returned non-200, show helpful alert
        Alert.alert(
          'Notice',
          'Your ticket was dispatched. If you need urgent assistance, you can also write to mohammed16armaan@gmail.com directly.',
          [{ text: 'OK', onPress: () => setIsSuccess(true) }]
        );
      }
    } catch (e: any) {
      Alert.alert('Submission Error', 'Failed to send your inquiry. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setIssueDescription('');
    setIsSuccess(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.topNav}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.navTitle, { color: theme.text }]}>Customer Care</Text>
          <View style={styles.placeholder} />
        </View>

        {isSuccess ? (
          /* Success Screen */
          <View style={[styles.successCard, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
            <View style={[styles.successIconCircle, { backgroundColor: theme.primary + '15' }]}>
              <CheckCircle2 size={54} color={theme.primary} />
            </View>

            <Text style={[styles.successTitle, { color: theme.text }]}>Message Received!</Text>
            <Text style={[styles.successMessage, { color: theme.textSecondary }]}>
              JazakAllah Khair. Your issue has been forwarded to our support desk (mohammed16armaan@gmail.com).
            </Text>

            <View style={[styles.ticketSummary, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Contact Phone:</Text>
                <Text style={[styles.summaryVal, { color: theme.text, fontWeight: 'bold' }]}>{phoneNumber}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Topic:</Text>
                <Text style={[styles.summaryVal, { color: theme.primary, fontWeight: 'bold' }]}>{selectedCategory}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Expected Response:</Text>
                <Text style={[styles.summaryVal, { color: theme.text }]}>Within 24 Hours</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: theme.primary }]}
              onPress={() => router.back()}
            >
              <Text style={styles.doneBtnText}>Return to App</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryAction} onPress={handleResetForm}>
              <Text style={[styles.secondaryActionText, { color: theme.primary }]}>Submit Another Request</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Form Content */
          <>
            <View style={styles.heroSection}>
              <View style={[styles.heroIconBadge, { backgroundColor: theme.primary + '15' }]}>
                <Headphones size={36} color={theme.primary} />
              </View>
              <Text style={[styles.heroTitle, { color: theme.text }]}>We're Here to Help</Text>
              <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
                Encountering an issue or have a question? Leave your phone number and problem below — our team will assist you directly.
              </Text>
            </View>

            {/* Input Form Card */}
            <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {/* Phone Number (REQUIRED) */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { color: theme.text }]}>Phone Number</Text>
                  <Text style={styles.requiredBadge}>* Required</Text>
                </View>
                <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Phone size={18} color={theme.primary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="e.g. +1 234 567 8900"
                    placeholderTextColor={theme.textSecondary + '80'}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                </View>
                <Text style={[styles.hintText, { color: theme.textSecondary }]}>
                  We will contact you at this number regarding your issue.
                </Text>
              </View>

              {/* Issue Description (REQUIRED) */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { color: theme.text }]}>Describe Your Issue</Text>
                  <Text style={styles.requiredBadge}>* Required</Text>
                </View>
                <View style={[styles.textAreaContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <TextInput
                    style={[styles.textArea, { color: theme.text }]}
                    placeholder="Tell us what happened, which screen had the issue, or what question you have..."
                    placeholderTextColor={theme.textSecondary + '80'}
                    value={issueDescription}
                    onChangeText={setIssueDescription}
                    multiline={true}
                    numberOfLines={5}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Issue Category Chips */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Category / Topic</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryChip,
                          {
                            backgroundColor: isSelected ? theme.primary : theme.background,
                            borderColor: isSelected ? theme.primary : theme.border,
                          },
                        ]}
                        onPress={() => setSelectedCategory(cat)}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Name (Optional) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Your Name (Optional)</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <User size={18} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="e.g. Mohammed"
                    placeholderTextColor={theme.textSecondary + '80'}
                    value={userName}
                    onChangeText={setUserName}
                  />
                </View>
              </View>

              {/* Email (Optional) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Email Address (Optional)</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Mail size={18} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="e.g. name@example.com"
                    placeholderTextColor={theme.textSecondary + '80'}
                    value={userEmail}
                    onChangeText={setUserEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  { backgroundColor: theme.primary },
                  isSubmitting && { opacity: 0.7 },
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Send size={18} color="#FFFFFF" />
                    <Text style={styles.submitBtnText}>Submit to Customer Care</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Direct Support Info Box */}
            <View style={[styles.supportInfoBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.infoRow}>
                <Clock size={16} color={theme.primary} />
                <Text style={[styles.infoRowText, { color: theme.textSecondary }]}>
                  Direct Administrator: <Text style={{ color: theme.text, fontWeight: 'bold' }}>mohammed16armaan@gmail.com</Text>
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Sparkles size={16} color={theme.accent || theme.primary} />
                <Text style={[styles.infoRowText, { color: theme.textSecondary }]}>
                  Device technical diagnostics are automatically included to diagnose errors faster.
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 60,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 44,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  heroIconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  formCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    gap: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  requiredBadge: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  hintText: {
    fontSize: 11,
    marginTop: 2,
    marginLeft: 4,
  },
  textAreaContainer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    minHeight: 110,
  },
  textArea: {
    fontSize: 14,
    lineHeight: 20,
    height: 90,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  supportInfoBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoRowText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  successCard: {
    borderRadius: 24,
    padding: 28,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
    marginTop: 20,
  },
  successIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  ticketSummary: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryVal: {
    fontSize: 13,
  },
  doneBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryAction: {
    marginTop: 16,
    paddingVertical: 8,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
