import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { extractVoiceInput } from '../../services/voice';
import { logout } from '../../services/auth';
import { Picker } from '@react-native-picker/picker';

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
        <Text style={styles.title}>Process Voice</Text>
        <Button title="Logout" onPress={handleLogout} variant="secondary" style={styles.logoutButton} />
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Patient Information</Text>
        <Input label="Patient ID *" value={patientId} onChangeText={setPatientId} editable={!loading} />
        <Input label="Age *" value={age} onChangeText={setAge} keyboardType="numeric" editable={!loading} />
        <Input label="Name" value={name} onChangeText={setName} editable={!loading} />
        <Input label="Mobile" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" editable={!loading} />
        
        <Text style={styles.label}>Gender *</Text>
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
        <Text style={styles.sectionTitle}>Upload Audio</Text>
        {audioFile ? (
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>{audioFile.name}</Text>
            <Text style={styles.fileSize}>{((audioFile.size || 0) / 1024).toFixed(2)} KB</Text>
          </View>
        ) : (
          <Text style={styles.noFile}>No file selected</Text>
        )}
        <Button title="Select Audio File" onPress={handlePickAudio} variant="secondary" disabled={loading} />
      </View>

      <Button title="Extract (Smart Transcription)" onPress={handleExtract} loading={loading} style={styles.submitButton} />

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.sectionTitle}>Medical Summary</Text>
          <Text style={styles.resultText}>
            {JSON.stringify(result, null, 2)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
    overflow: 'hidden',
  },
  fileInfo: {
    marginBottom: 16,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 14,
    color: '#666',
  },
  noFile: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 32,
  },
  resultCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
  },
});
