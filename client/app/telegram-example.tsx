import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTelegram } from '@/hooks/useTelegram';
import { useTelegramTheme } from '@/hooks/useTelegramTheme';

export default function TelegramExample() {
  const telegram = useTelegram();
  const { theme, isTelegramTheme } = useTelegramTheme();
  const [authStatus, setAuthStatus] = useState<string>('Not authenticated');

  useEffect(() => {
    // Authenticate user with backend when in Telegram
    const authenticateUser = async () => {
      if (telegram.isInTelegram && telegram.initData) {
        try {
          setAuthStatus('Authenticated successfully');
        } catch (error) {
          setAuthStatus(`Authentication error: ${error}`);
        }
      }
    };

    authenticateUser();
  }, [telegram.isInTelegram, telegram.initData]);

  const handleMainButton = () => {
    if (telegram.MainButton) {
      telegram.MainButton.setText('Processing...');
      telegram.MainButton.showProgress();

      // Simulate some work
      setTimeout(() => {
        telegram.MainButton.hideProgress();
        telegram.MainButton.setText('Done!');
        telegram.HapticFeedback.notificationOccurred('success');
      }, 2000);
    }
  };

  const handleBackButton = () => {
    telegram.BackButton.show();
    telegram.BackButton.onClick(() => {
      console.log('Back button pressed');
      telegram.BackButton.hide();
    });
  };

  const handleShowPopup = async () => {
    try {
      const result = await telegram.showPopup({
        title: 'Example Popup',
        message: 'This is a Telegram popup example',
        buttons: [
          { id: 'ok', type: 'ok', text: 'OK' },
          { id: 'cancel', type: 'cancel', text: 'Cancel' },
        ],
      });
      console.log('Popup result:', result);
    } catch (error) {
      console.error('Popup error:', error);
    }
  };

  const handleShowAlert = async () => {
    await telegram.showAlert('This is a Telegram alert!');
  };

  const handleShowConfirm = async () => {
    const confirmed = await telegram.showConfirm('Are you sure?');
    console.log('User confirmed:', confirmed);
  };

  const handleShareUrl = () => {
    telegram.shareUrl('https://example.com', 'Check out this awesome app!');
  };

  const handleHapticFeedback = () => {
    telegram.HapticFeedback.impactOccurred('medium');
  };

  if (telegram.isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.text, { color: theme.text }]}>Loading Telegram SDK...</Text>
      </View>
    );
  }

  if (telegram.error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.text, { color: theme.textDestructive }]}>
          Telegram SDK Error: {telegram.error}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.section}>
        <Text style={[styles.title, { color: theme.text }]}>Telegram Web App Example</Text>

        {/* Environment Info */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.subtitle, { color: theme.text }]}>Environment</Text>
          <Text style={[styles.info, { color: theme.textSecondary }]}>
            In Telegram: {telegram.isInTelegram ? 'Yes' : 'No'}
          </Text>
          <Text style={[styles.info, { color: theme.textSecondary }]}>
            Platform: {telegram.platform || 'Unknown'}
          </Text>
          <Text style={[styles.info, { color: theme.textSecondary }]}>
            Version: {telegram.version || 'Unknown'}
          </Text>
          <Text style={[styles.info, { color: theme.textSecondary }]}>
            Color Scheme: {telegram.colorScheme}
          </Text>
          <Text style={[styles.info, { color: theme.textSecondary }]}>
            Using Telegram Theme: {isTelegramTheme ? 'Yes' : 'No'}
          </Text>
        </View>

        {/* User Info */}
        {telegram.user && (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.subtitle, { color: theme.text }]}>User Info</Text>
            <Text style={[styles.info, { color: theme.textSecondary }]}>
              ID: {telegram.user.id}
            </Text>
            <Text style={[styles.info, { color: theme.textSecondary }]}>
              Name: {telegram.user.first_name} {telegram.user.last_name || ''}
            </Text>
            <Text style={[styles.info, { color: theme.textSecondary }]}>
              Username: {telegram.user.username || 'Not set'}
            </Text>
            <Text style={[styles.info, { color: theme.textSecondary }]}>
              Premium: {telegram.user.is_premium ? 'Yes' : 'No'}
            </Text>
          </View>
        )}

        {/* Authentication Status */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.subtitle, { color: theme.text }]}>Authentication</Text>
          <Text style={[styles.info, { color: theme.textSecondary }]}>
            Status: {authStatus}
          </Text>
        </View>

        {/* Actions */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.subtitle, { color: theme.text }]}>Actions</Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.button }]}
            onPress={handleMainButton}
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>
              Test Main Button
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.button }]}
            onPress={handleBackButton}
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>
              Show Back Button
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.button }]}
            onPress={handleShowPopup}
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>
              Show Popup
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.button }]}
            onPress={handleShowAlert}
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>
              Show Alert
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.button }]}
            onPress={handleShowConfirm}
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>
              Show Confirm
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.button }]}
            onPress={handleShareUrl}
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>
              Share URL
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.button }]}
            onPress={handleHapticFeedback}
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>
              Haptic Feedback
            </Text>
          </TouchableOpacity>
        </View>

        {/* Theme Colors */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.subtitle, { color: theme.text }]}>Theme Colors</Text>
          <View style={styles.colorGrid}>
            {Object.entries(theme).map(([key, value]) => (
              <View key={key} style={styles.colorItem}>
                <View style={[styles.colorBox, { backgroundColor: value }]} />
                <Text style={[styles.colorLabel, { color: theme.textSecondary }]}>
                  {key}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  info: {
    fontSize: 14,
    marginBottom: 4,
  },
  button: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  colorLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});
