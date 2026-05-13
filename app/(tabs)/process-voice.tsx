import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { Typography } from '../../components/ui/Typography';
import { extractVoiceInput } from '../../services/voice';
import { logout } from '../../services/auth';
import { Picker } from '@react-native-picker/picker';
import { theme, shadows } from '../../constants/theme';

export default function ProcessVoiceScreen() {
  const [patientId, setPatientId] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  
  const [audioFile, setAudioFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  const handlePickAudio = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setAudioFile(res.assets[0]);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick audio file');
    }
  };

  const handleExtract = async () => {
    if (!patientId || !age || !gender) {
      Alert.alert('Validation Error', 'Patient ID, Age, and Gender are required.');
      return;
    }

    if (!audioFile) {
      Alert.alert('Validation Error', 'Please select an audio file.');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const response = await extractVoiceInput({
        patientInfo: {
          patientId,
          age,
          gender,
          mobile,
          name,
        },
        processType: 'processingData',
        audio: audioFile,
      });

      setResult(response);
    } catch (error: any) {
      Alert.alert('Extraction Failed', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Typography.Heading>Process Voice</Typography.Heading>
        <Button.Secondary 
          title="Logout" 
          onPress={handleLogout} 
          style={styles.logoutButton}
          textStyle={{ fontSize: theme.fontSize.sm }} 
        />
      </View>

      <View style={styles.formCard}>
        <Typography.Subheading style={styles.sectionTitle}>Patient Information</Typography.Subheading>
        <TextInput label="Patient ID *" value={patientId} onChangeText={setPatientId} editable={!loading} />
        <TextInput label="Age *" value={age} onChangeText={setAge} keyboardType="numeric" editable={!loading} />
        <TextInput label="Name" value={name} onChangeText={setName} editable={!loading} />
        <TextInput label="Mobile" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" editable={!loading} />
        
        <Typography.Label style={styles.label}>Gender *</Typography.Label>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue)}
            enabled={!loading}
          >
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="MALE" value="MALE" />
            <Picker.Item label="FEMALE" value="FEMALE" />
            <Picker.Item label="OTHERS" value="OTHERS" />
          </Picker>
        </View>
      </View>

      <View style={styles.formCard}>
        <Typography.Subheading style={styles.sectionTitle}>Upload Audio</Typography.Subheading>
        {audioFile ? (
          <View style={styles.fileInfo}>
            <Typography.Paragraph style={styles.fileName}>{audioFile.name}</Typography.Paragraph>
            <Typography.Label>{((audioFile.size || 0) / 1024).toFixed(2)} KB</Typography.Label>
          </View>
        ) : (
          <Typography.Paragraph style={styles.noFile}>No file selected</Typography.Paragraph>
        )}
        <Button.Secondary title="Select Audio File" onPress={handlePickAudio} disabled={loading} />
      </View>

      <Button.Primary title="Extract (Smart Transcription)" onPress={handleExtract} loading={loading} style={styles.submitButton} />

      {result && (
        <View style={styles.resultCard}>
          <Typography.Subheading style={styles.sectionTitle}>Medical Summary</Typography.Subheading>
          <Typography.Paragraph style={styles.resultText}>
            {JSON.stringify(result, null, 2)}
          </Typography.Paragraph>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing['2xl'],
  },
  logoutButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  formCard: {
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...shadows.sm,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  label: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background.surface,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    minHeight: 48,
    justifyContent: 'center',
  },
  fileInfo: {
    marginBottom: theme.spacing.md,
  },
  fileName: {
    fontWeight: '500',
  },
  noFile: {
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.md,
    fontStyle: 'italic',
  },
  submitButton: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  resultCard: {
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    ...shadows.sm,
  },
  resultText: {
    fontSize: theme.fontSize.sm,
  },
});
