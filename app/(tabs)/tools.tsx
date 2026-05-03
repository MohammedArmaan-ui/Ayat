import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, useColorScheme, Animated } from 'react-native';
import { Calculator, RefreshCw, ChevronRight, Info, Compass, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Text } from '@/components/Themed';
import { Colors } from '../../src/theme/colors';
import { SettingsService, AppSettings } from '../../src/services/settingsService';

export default function ToolsScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const systemColorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await SettingsService.getSettings();
    setSettings(s);
  };

  const theme = settings ? (Colors as any)[settings.theme] : (Colors as any)[systemColorScheme];

  const ToolItem = ({ icon: Icon, title, description, route }: any) => (
    <TouchableOpacity 
      style={[styles.toolCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={() => router.push(route)}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.primary + '10' }]}>
        <Icon size={24} color={theme.primary} />
      </View>
      <View style={styles.toolInfo}>
        <Text style={[styles.toolTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.toolDesc, { color: theme.textSecondary }]}>{description}</Text>
      </View>
      <ChevronRight size={20} color={theme.border} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Spiritual Tools</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Practical utilities to assist your daily worship and discipline.
          </Text>
        </View>

        <View style={styles.list}>
          <ToolItem 
            icon={Calendar} 
            title="Islamic Calendar" 
            description="Hijri dates and holy days"
            route="/calendar"
          />
          <ToolItem 
            icon={Calculator} 
            title="Zakat Calculator" 
            description="Calculate your yearly zakat"
            route="/(tabs)/zakat"
          />
          <ToolItem 
            icon={RefreshCw} 
            title="Tasbih Counter" 
            description="Digital prayer beads"
            route="/(tabs)/tasbih"
          />
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.primary + '05' }]}>
          <Info size={18} color={theme.primary} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            More tools like Mosque Finder coming soon in future updates.
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
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  list: {
    gap: 16,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  toolDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoCard: {
    flexDirection: 'row',
    marginTop: 40,
    padding: 20,
    borderRadius: 16,
    gap: 12,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
});
