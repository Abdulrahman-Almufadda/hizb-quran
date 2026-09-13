import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { clampPage, TOTAL_MUSHAF_PAGES } from '../state/readerStore';
import type { Palette } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  visible: boolean;
  currentPage: number;
  palette: Palette;
  onCancel: () => void;
  onSubmit: (page: number) => void;
};

export function GoToPageDialog({ visible, currentPage, palette, onCancel, onSubmit }: Props): React.JSX.Element {
  const [text, setText] = useState(String(currentPage));

  const handleShow = (): void => {
    setText(String(currentPage));
  };

  const submit = (): void => {
    const parsed = Number.parseInt(text, 10);
    onSubmit(clampPage(Number.isFinite(parsed) ? parsed : currentPage));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onShow={handleShow}
      onRequestClose={onCancel}
    >
      <View style={[styles.overlay, { backgroundColor: palette.overlay }]}>
        <View style={[styles.dialog, { backgroundColor: palette.card }]}>
          <Text style={[styles.title, { color: palette.text }]}>انتقل إلى صفحة</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            keyboardType="number-pad"
            autoFocus
            textAlign="center"
            style={[styles.input, { color: palette.text, borderColor: palette.border }]}
            placeholder={`١ - ${TOTAL_MUSHAF_PAGES}`}
            placeholderTextColor={palette.textMuted}
            onSubmitEditing={submit}
          />
          <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel} style={styles.actionButton}>
              <Text style={[styles.actionText, { color: palette.textMuted }]}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={submit} style={styles.actionButton}>
              <Text style={[styles.actionText, { color: palette.gold, fontFamily: fonts.bold }]}>انتقل</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  dialog: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 18,
    writingDirection: 'rtl',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontFamily: fonts.regular,
    fontSize: 18,
  },
  actions: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    fontFamily: fonts.regular,
    fontSize: 16,
  },
});
