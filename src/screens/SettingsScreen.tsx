import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { Directory, Paths } from 'expo-file-system';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DEFAULT_RECITER_ID, RECITERS } from '../audio/reciters';
import { BackButton } from '../components/BackButton';
import { useAudioStore } from '../state/audioStore';
import { useAppPalette, useThemeStore, type ThemeMode } from '../state/themeStore';
import { fonts, typeScale } from '../theme/typography';

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: 'light', label: 'فاتح', icon: 'sunny-outline' },
  { mode: 'dark', label: 'داكن', icon: 'moon-outline' },
  { mode: 'system', label: 'حسب النظام', icon: 'phone-portrait-outline' },
];

export default function SettingsScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const { palette } = useAppPalette();
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);
  const reciterId = useAudioStore((s) => s.reciterId ?? DEFAULT_RECITER_ID);
  const setReciter = useAudioStore((s) => s.setReciter);
  const [clearing, setClearing] = useState(false);

  const clearAudioCache = async (): Promise<void> => {
    setClearing(true);
    try {
      const dir = new Directory(Paths.cache, 'audio');
      if (dir.exists) dir.delete();
      Alert.alert('تم', 'تم مسح ذاكرة التخزين المؤقت للصوت.');
    } catch (error) {
      console.error('[Settings] Failed to clear audio cache:', error);
      Alert.alert('خطأ', 'تعذر مسح ذاكرة التخزين المؤقت.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        <BackButton palette={palette} onPress={() => navigation.goBack()} />
        <Text style={[styles.headerTitle, { color: palette.text }]}>الإعدادات</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: palette.gold }]}>المظهر</Text>
        <View style={styles.optionsRow}>
          {THEME_OPTIONS.map((opt) => {
            const active = themeMode === opt.mode;
            return (
              <TouchableOpacity
                key={opt.mode}
                onPress={() => setThemeMode(opt.mode)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: active ? palette.gold : palette.goldMuted,
                    borderColor: palette.gold,
                  },
                ]}
              >
                <Ionicons name={opt.icon} size={15} color={active ? palette.primaryText : palette.gold} />
                <Text style={[styles.pillText, { color: active ? palette.primaryText : palette.gold }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: palette.gold }]}>القارئ</Text>
        {RECITERS.map((reciter) => {
          const active = reciterId === reciter.id;
          return (
            <TouchableOpacity key={reciter.id} style={styles.row} onPress={() => setReciter(reciter.id)}>
              <Text style={[styles.rowText, { color: palette.text }]}>{reciter.nameAr}</Text>
              <Ionicons
                name={active ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color={active ? palette.gold : palette.textMuted}
              />
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.sectionTitle, { color: palette.gold }]}>التخزين</Text>
        <TouchableOpacity style={styles.row} onPress={clearAudioCache} disabled={clearing}>
          <Text style={[styles.rowText, { color: palette.text }]}>مسح ذاكرة الصوت المؤقتة</Text>
          <Ionicons name="trash-outline" size={18} color={palette.danger} />
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: palette.gold }]}>عن التطبيق</Text>
        <Text style={[styles.aboutText, { color: palette.textMuted }]}>
          حزب — تطبيق لقراءة القرآن الكريم كاملاً بخط المصحف الشريف، مع البحث والعلامات المرجعية والاستماع
          للتلاوة. البيانات (آخر صفحة مقروءة، العلامات المرجعية، الإعدادات) تُخزَّن على جهازك فقط. عند
          الاستماع للتلاوة يتصل التطبيق بخدمة everyayah.com لتحميل الصوت.
        </Text>
        <Text style={[styles.versionText, { color: palette.textMuted }]}>
          الإصدار {Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerButton: { minWidth: 40 },
  headerTitle: { fontFamily: fonts.bold, fontSize: typeScale.screenTitle, writingDirection: 'rtl' },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    writingDirection: 'rtl',
    textAlign: 'right',
    marginTop: 24,
    marginBottom: 10,
  },
  optionsRow: { flexDirection: 'row-reverse', gap: 8 },
  pill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: { fontFamily: fonts.regular, fontSize: 14 },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowText: { fontFamily: fonts.regular, fontSize: 16, writingDirection: 'rtl' },
  aboutText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  versionText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
});
