import React, { useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

// Helper: Convert base64 data URI to Blob (for web)
function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

const FileAttachment = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);

  const pickFiles = async () => {
    try {
      setUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
        type: '*/*',
      });
      if (!result.canceled) {
        const newFiles = result.assets || [];
        for (const file of newFiles) {
          let fileForUpload = file;
          // If on web and uri is base64, convert to File object
          if (
            Platform.OS === 'web' &&
            file.uri.startsWith('data:') &&
            typeof window !== 'undefined'
          ) {
            const blob = dataURLtoBlob(file.uri);
            fileForUpload = new File([blob], file.name || 'upload', { type: file.mimeType || file.type || blob.type });
            // Patch: add .uri property for compatibility with uploadTaskAttachment
            fileForUpload.uri = file.uri;
          }
          await onUpload(fileForUpload);
        }
      }
    } catch (err) {
      console.warn('File picking error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button title={uploading ? 'Uploading...' : 'Attach Files'} onPress={pickFiles} disabled={uploading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  fileName: {
    flex: 1,
    fontSize: 16,
  },
  removeText: {
    color: 'red',
    marginLeft: 10,
  },
});

export default FileAttachment; 