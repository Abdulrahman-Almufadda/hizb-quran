import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { RECITERS } from '../audio/reciters';
import type { Palette } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  visible: boolean;
  selectedId: string;
  palette: Palette;
  onSelect: (reciterId: string) => void;
  onClose: () => void;
};

export function ReciterPickerModal({ visible, selectedId, palette, onSelect, onClose }: Props): React.JSX.Element {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={[styles.overlay, { backgroundColor: palette.overlay }]} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={[styles.dialog, { backgroundColor: palette.card }]}>
          <Text style={[styles.title, { color: palette.text }]}>اختر القارئ</Text>
          {RECITERS.map((reciter) => {
            const active = reciter.id === selectedId;
            return (
              <TouchableOpacity
                key={reciter.id}
                style={[styles.row, active ? { backgroundColor: palette.goldMuted } : null]}
                onPress={() => {
                  onSelect(reciter.id);
                  onClose();
                }}
              >
                <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={20} color={palette.gold} />
                <Text style={[styles.rowText, { color: palette.text }]}>{reciter.nameAr}</Text>
              </TouchableOpacity>
            );
          })}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 340, borderRadius: 16, padding: 16 },
  title: { fontFamily: fonts.bold, fontSize: 18, writingDirection: 'rtl', textAlign: 'center', marginBottom: 10 },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10 },
  rowText: { fontFamily: fonts.regular, fontSize: 17, writingDirection: 'rtl' },
});
