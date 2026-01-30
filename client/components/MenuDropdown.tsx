import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

const MenuDropdown = () => {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  const toggleDropdown = () => {
    setVisible(!visible);
  };

  const navigateTo = (path: string) => {
    setVisible(false);
    router.push(path as any);
  };

  return (
    <View>
      <TouchableOpacity style={styles.menuButton} onPress={toggleDropdown}>
        <Text style={styles.menuText}>☰</Text>
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.dropdown}>
            <TouchableOpacity onPress={() => navigateTo('/my-order')} style={styles.item}>
              <Text style={styles.itemText}>My Order</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigateTo('/rewards')} style={styles.item}>
              <Text style={styles.itemText}>Rewards</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigateTo('/cart')} style={styles.item}>
              <Text style={styles.itemText}>Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigateTo('/profile')} style={styles.item}>
              <Text style={styles.itemText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  menuText: {
    color: '#ffffff',
    fontSize: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  dropdown: {
    marginTop: 70,
    marginLeft: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    paddingVertical: 10,
    width: 180,
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 255, 0.1)',
  },
  itemText: {
    fontSize: 14,
    color: '#00ffff',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
});

export default MenuDropdown;
