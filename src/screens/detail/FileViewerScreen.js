import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Image, Modal } from 'react-native';
import { useTheme } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import * as Sharing from 'expo-sharing';
import ImageViewer from 'react-native-image-zoom-viewer';

const FileViewerScreen = ({ route }) => {
  const { fileUrl, fileName, token } = route.params || {};
  const [error, setError] = useState('');
  const theme = useTheme();

  // Improved document detection: match common document extensions
  const isDoc =
    (fileName && /\.(docx|doc|xlsx|xls|pptx|ppt|pdf)/i.test(fileName)) ||
    (fileUrl && /\.(docx|doc|xlsx|xls|pptx|ppt|pdf)/i.test(fileUrl));

  // Improved image detection: match image extensions anywhere in the string
  const isImage =
    (fileName && /\.(jpg|jpeg|png|gif|bmp|webp)/i.test(fileName)) ||
    (fileUrl && /\.(jpg|jpeg|png|gif|bmp|webp)/i.test(fileUrl));

  const isLocal = fileUrl && fileUrl.startsWith('file://');

  // For local documents (docx, pdf, etc.), use expo-sharing to open in an external app
  if (isDoc && isLocal) {
    Sharing.shareAsync(fileUrl)
      .catch(err => {
        setError('Failed to open file: ' + (err.message || err));
      });
    return (
      <View style={styles.centered}>
        <Text style={{ color: theme.colors.text }}>Opening file in another app...</Text>
      </View>
    );
  }

  if (!fileUrl) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: theme.colors.error }}>No file URL provided.</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: theme.colors.error, marginBottom: 12 }}>{error}</Text>
      </View>
    );
  }

  if (isImage) {
    // Use react-native-image-zoom-viewer for pinch-to-zoom and pan directly in the screen
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ImageViewer
          imageUrls={[{ url: fileUrl }]}
          enableSwipeDown={false}
          renderIndicator={() => null}
          backgroundColor={theme.colors.background}
          saveToLocalByLongPress={false}
        />
      </View>
    );
  }

  // For non-image remote files, fallback to WebView
  return (
    <WebView
      source={{
        uri: fileUrl,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      }}
      style={{ flex: 1 }}
      onError={syntheticEvent => {
        const { nativeEvent } = syntheticEvent;
        setError('Failed to load file: ' + (nativeEvent?.description || 'Unknown error'));
      }}
      startInLoadingState
    />
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FileViewerScreen; 