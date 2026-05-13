import { apiClient } from './api/client';
import * as DocumentPicker from 'expo-document-picker';

export interface ExtractInputPayload {
  patientInfo: {
    patientId: string;
    age: string;
    gender: string;
    mobile?: string;
    name?: string;
  };
  processType: string;
  id?: string;
  audio?: DocumentPicker.DocumentPickerAsset;
  inputText?: string;
}

export async function extractVoiceInput(payload: ExtractInputPayload) {
  const requestBody: Record<string, unknown> = {
    patientInfo: payload.patientInfo,
    processType: payload.processType || 'processingData',
    id: payload.id || '',
    inputText: payload.inputText || '',
  };

  if (payload.audio) {
    requestBody.audio = {
      uri: payload.audio.uri,
      name: payload.audio.name || 'audio.m4a',
      type: payload.audio.mimeType || 'audio/m4a',
    };
  }

  return await apiClient.post('/medicalscribe/extract-input', requestBody, {
    hasAttachment: true,
  });
}
