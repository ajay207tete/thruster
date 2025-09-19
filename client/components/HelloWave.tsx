import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function HelloWave() {
  return (
    <View style={styles.container}>
      <Text style={styles.wave}>👋</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 8,
  },
  wave: {
    fontSize: 28,
  },
});
