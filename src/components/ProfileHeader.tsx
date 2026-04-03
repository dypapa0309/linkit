import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProfileHeaderProps {
  name: string;
  bio: string;
}

export default function ProfileHeader({ name, bio }: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatar} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.bio}>{bio}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEEEEE',
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#777777',
  },
});