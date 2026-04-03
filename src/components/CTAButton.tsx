import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface CTAButtonProps {
  text: string;
  onPress: () => void;
}

export default function CTAButton({ text, onPress }: CTAButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#000000',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
