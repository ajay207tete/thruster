import React, { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Dimensions } from 'react-native';

interface CollapsibleProps extends PropsWithChildren {
  title: string;
  icon?: string;
  initiallyExpanded?: boolean;
}

export function Collapsible({ children, title, icon, initiallyExpanded = false }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(initiallyExpanded);

  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <View style={styles.headingContent}>
          <Text style={styles.icon}>{icon || '▼'}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.arrow, isOpen && styles.arrowOpen]}>
            {isOpen ? '▲' : '▼'}
          </Text>
        </View>
      </TouchableOpacity>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const { width } = Dimensions.get('window');
const isMobile = width < 768;

const styles = StyleSheet.create({
  container: {
    marginBottom: isMobile ? 20 : 25,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#00ffff',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
  },
  heading: {
    padding: isMobile ? 15 : 20,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
  headingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    fontSize: isMobile ? 16 : 18,
    color: '#ff0080',
    marginRight: 10,
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  title: {
    flex: 1,
    color: '#ffffff',
    fontSize: isMobile ? 16 : 18,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  arrow: {
    fontSize: isMobile ? 14 : 16,
    color: '#00ffff',
    fontWeight: 'bold',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  arrowOpen: {
    color: '#ff0080',
  },
  content: {
    padding: isMobile ? 15 : 20,
  },
});
