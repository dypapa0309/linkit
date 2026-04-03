import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ServiceCardItemProps {
  title: string;
  description: string;
  onPress: () => void;
}

export default function ServiceCardItem({ title, description, onPress }: ServiceCardItemProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#777777',
  },
});