import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, useColorScheme, Switch, TextInput } from 'react-native';
import { Moon, Sun, Type, Globe, Info, Volume2, BookOpen, MapPin, Clock } from 'lucide-react-native';

import { Text } from '@/components/Themed';
import { Colors } from '../../src/theme/colors';
import { SettingsService, AppSettings, AppTheme } from '../../src/services/settingsService';

export default function SettingsScreen() {
  const systemColorScheme = useColorScheme();
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await SettingsService.getSettings();
    setSettings(s);
  };

  const updateSetting = async (key: keyof AppSettings, value: any) => {
    await SettingsService.updateSetting(key, value);
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  if (!settings) return null;

  const theme = (Colors as any)[settings.theme] || Colors.light;

  const speakers = [
    { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
    { id: 'ar.minshawi', name: 'Mohamed Siddiq al-Minshawi' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Appearance</Text>
        
        <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
          <View style={styles.settingInfo}>
            <Sun size={20} color={theme.text} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Theme</Text>
          </View>
          <View style={styles.themeSelector}>
            {(['light', 'dark', 'sepia'] as AppTheme[]).map((t) => (
              <TouchableOpacity 
                key={t}
                onPress={() => updateSetting('theme', t)}
                style={[
                  styles.themeButton, 
                  { backgroundColor: (Colors as any)[t].background, borderColor: settings.theme === t ? theme.primary : theme.border }
                ]}
              >
                <Text style={{ color: (Colors as any)[t].text, fontSize: 10 }}>{t.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
          <View style={styles.settingInfo}>
            <Type size={20} color={theme.text} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Arabic Font Size</Text>
          </View>
          <View style={styles.fontSizeControls}>
            <TouchableOpacity onPress={() => updateSetting('fontSize', Math.max(16, settings.fontSize - 2))} style={styles.sizeButton}>
              <Text style={{ color: theme.primary, fontSize: 20 }}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.sizeText, { color: theme.text }]}>{settings.fontSize}</Text>
            <TouchableOpacity onPress={() => updateSetting('fontSize', Math.min(40, settings.fontSize + 2))} style={styles.sizeButton}>
              <Text style={{ color: theme.primary, fontSize: 20 }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Reader Preferences</Text>
        
        <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
          <View style={styles.settingInfo}>
            <Globe size={20} color={theme.text} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Translation</Text>
          </View>
          <Switch 
            value={settings.translationEnabled} 
            onValueChange={(v) => updateSetting('translationEnabled', v)}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>

        <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
          <View style={styles.settingInfo}>
            <Globe size={20} color={theme.text} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Transliteration</Text>
          </View>
          <Switch 
            value={settings.transliterationEnabled} 
            onValueChange={(v) => updateSetting('transliterationEnabled', v)}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>

        <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
          <View style={styles.settingInfo}>
            <BookOpen size={20} color={theme.text} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Word by Word (English)</Text>
          </View>
          <Switch 
            value={settings.wordByWordEnabled} 
            onValueChange={(v) => updateSetting('wordByWordEnabled', v)}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Recitation</Text>
        
        <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
          <View style={styles.settingInfo}>
            <Volume2 size={20} color={theme.text} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Select Speaker</Text>
          </View>
        </View>
        <View style={styles.speakerList}>
          {speakers.map((s) => (
            <TouchableOpacity 
              key={s.id}
              onPress={() => updateSetting('selectedSpeaker', s.id)}
              style={[
                styles.speakerButton, 
                { 
                  backgroundColor: settings.selectedSpeaker === s.id ? theme.primary : theme.surface,
                  borderColor: theme.border 
                }
              ]}
            >
              <Text style={{ color: settings.selectedSpeaker === s.id ? '#FFF' : theme.text }}>{s.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Location</Text>
        <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
          <View style={styles.settingInfo}>
            <MapPin size={20} color={theme.text} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>City</Text>
          </View>
          <TextInput 
            style={[styles.locationInput, { color: theme.text, borderColor: theme.border }]}
            defaultValue={settings.locationCity}
            onEndEditing={(e) => updateSetting('locationCity', e.nativeEvent.text)}
            placeholder="e.g. London"
            placeholderTextColor={theme.textSecondary}
          />
        </View>
        <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
          <View style={styles.settingInfo}>
            <Globe size={20} color={theme.text} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Country</Text>
          </View>
          <TextInput 
            style={[styles.locationInput, { color: theme.text, borderColor: theme.border }]}
            defaultValue={settings.locationCountry}
            onEndEditing={(e) => updateSetting('locationCountry', e.nativeEvent.text)}
            placeholder="e.g. UK"
            placeholderTextColor={theme.textSecondary}
          />
        </View>
        <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
          <View style={styles.settingInfo}>
            <Clock size={20} color={theme.text} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Time Format</Text>
          </View>
          <View style={styles.themeSelector}>
            {['12h', '24h'].map((f) => (
              <TouchableOpacity 
                key={f}
                onPress={() => updateSetting('timeFormat', f as any)}
                style={[
                  styles.themeButton, 
                  { backgroundColor: settings.timeFormat === f ? theme.primary : theme.surface, borderColor: theme.border }
                ]}
              >
                <Text style={{ color: settings.timeFormat === f ? '#FFF' : theme.text, fontSize: 10 }}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>About</Text>
        <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
          <View style={styles.settingInfo}>
            <Info size={20} color={theme.text} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Version</Text>
          </View>
          <Text style={{ color: theme.textSecondary }}>1.0.0 (Ayat)</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          Made with spiritual dedication for the Ummah.
        </Text>
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
    letterSpacing: 1,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  themeSelector: {
    flexDirection: 'row',
  },
  themeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    marginLeft: 8,
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sizeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 78, 59, 0.1)',
  },
  sizeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
  speakerList: {
    marginTop: 8,
  },
  speakerButton: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
  locationInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 150,
    fontSize: 14,
    textAlign: 'right',
  },
});
