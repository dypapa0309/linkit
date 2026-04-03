import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from '../i18n';

interface TrustBlockProps {
  reviewCount: number;
  responseTime: string;
  reuseRate: string;
}

export default function TrustBlock({ reviewCount, responseTime, reuseRate }: TrustBlockProps) {
  const { t } = useTranslation();

  const hasTrustData = reviewCount > 0 || Boolean(responseTime.trim()) || Boolean(reuseRate.trim());

  if (!hasTrustData) {
    return null;
  }

  return (
    <View style={styles.container}>
      {reviewCount > 0 ? (
        <Text style={styles.item}>
          <Text style={styles.bold}>{reviewCount}</Text> {t.trust.reviews}
        </Text>
      ) : null}
      {responseTime.trim() ? (
        <Text style={styles.item}>
          <Text style={styles.bold}>{responseTime}</Text> {t.trust.response}
        </Text>
      ) : null}
      {reuseRate.trim() ? (
        <Text style={styles.item}>
          <Text style={styles.bold}>{reuseRate}</Text> {t.trust.reuse}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginTop: 24,
  },
  item: {
    fontSize: 12,
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
});
