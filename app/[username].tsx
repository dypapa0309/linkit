import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import PublicProfileScreen from '../src/screens/PublicProfileScreen';

export default function UsernamePage() {
  const params = useLocalSearchParams();
  const username = String(params.username ?? 'anonymous');

  return <PublicProfileScreen username={username} />;
}
