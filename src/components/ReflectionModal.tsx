import React, { useState } from 'react';
import { View, StyleSheet, Modal, TextInput, TouchableOpacity, useColorScheme } from 'react-native';
import { Text } from '@/components/Themed';
import { Colors } from '../theme/colors';
import { X } from 'lucide-react-native';

interface ReflectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  ayahReference: string;
}

export const ReflectionModal: React.FC<ReflectionModalProps> = ({ visible, onClose, onSave, ayahReference }) => {
  const [note, setNote] = useState('');
  const colorScheme = useColorScheme() ?? 'light';
  const theme = (Colors as any)[colorScheme] || Colors.light;

  const handleSave = () => {
    onSave(note);
    setNote('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Add Reflection</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.reference, { color: theme.textSecondary }]}>{ayahReference}</Text>
          
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder="Write your reflection here..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={6}
            value={note}
            onChangeText={setNote}
            textAlignVertical="top"
          />

          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Reflection</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  reference: {
    fontSize: 14,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    height: 150,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 24,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
