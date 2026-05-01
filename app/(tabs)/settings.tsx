import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { Moon, Sun, Type, Globe, Info, Download } from 'lucide-react-native';

import { Text } from '@/components/Themed';
import { Colors } from '../../src/theme/colors';

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = (Colors as any)[colorScheme] || Colors.light;

  const SettingItem = ({ icon: Icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity 
      style={[styles.item, { borderBottomColor: theme.border }]} 
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: 'rgba(6, 78, 59, 0.1)' }]}>
        <Icon size={20} color={theme.primary} />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: theme.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Appearance</Text>
        <SettingItem 
          icon={colorScheme === 'dark' ? Moon : Sun} 
          title="Theme" 
          subtitle={colorScheme.charAt(0).toUpperCase() + colorScheme.slice(1)} 
        />
        <SettingItem 
          icon={Type} 
          title="Reading Font" 
          subtitle="Uthmanic Madani" 
        />
        <SettingItem 
          icon={Type} 
          title="Font Size" 
          subtitle="24pt" 
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Content</Text>
        <SettingItem 
          icon={Globe} 
          title="Translation" 
          subtitle="Sahih International" 
        />
        <SettingItem 
          icon={Download} 
          title="Offline Data" 
          subtitle="Manage surah downloads" 
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>About</Text>
        <SettingItem 
          icon={Info} 
          title="Ayat Version" 
          subtitle="1.0.0" 
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
