import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import BackButton from '@/components/BackButton';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

export default function PageHeader({
  title,
  showBackButton = true,
  onBackPress,
  rightComponent
}: PageHeaderProps) {
  return (
    <View style={styles.header}>
      {showBackButton ? (
        <BackButton onPress={onBackPress} />
      ) : (
        <View style={styles.placeholder} />
      )}
      <View style={styles.titleContainer}>
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>
      {rightComponent ? (
        <View style={styles.rightContainer}>
          {rightComponent}
        </View>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#00ff00',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: '#00ff00',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  placeholder: {
    width: 32,
  },
  rightContainer: {
    width: 32,
    alignItems: 'center',
  },
});
