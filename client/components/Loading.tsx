import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface LoadingProps {
  visible: boolean;
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  visible,
  message = 'Loading...',
  size = 'large',
  color = '#007AFF',
}) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}} // Prevent closing on Android
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.container}>
          <ActivityIndicator size={size} color={color} />
          {message && (
            <ThemedText style={styles.message}>{message}</ThemedText>
          )}
        </ThemedView>
      </View>
    </Modal>
  );
};

interface InlineLoadingProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  message,
  size = 'small',
  color = '#007AFF',
}) => {
  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <ThemedText style={styles.inlineMessage}>{message}</ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 120,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  inlineMessage: {
    marginLeft: 10,
    fontSize: 14,
  },
});
