import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import TonConnectButton from '../../components/TonConnectButton';
import MenuDropdown from '../../components/MenuDropdown';

export default function Index() {
  return (
    <ImageBackground
      source={require('../../assets/images/welcome.jpg')}
      style={styles.background}
      resizeMode="stretch"
    >
      <View style={styles.header}>
        <MenuDropdown />
        <TonConnectButton />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Thruster</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/shop')}>
            <Text style={styles.buttonText}>Go to Shop</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#ffffff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: 'rgba(0,123,255,0.8)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginHorizontal: 10,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
