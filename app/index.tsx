import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { useTranslation } from '../src/i18n';
import { useAuthStore } from '../src/stores/authStore';

export default function Home() {
  const { t } = useTranslation();
  const initialized = useAuthStore((state) => state.initialized);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!initialized) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingTitle}>{t.common.loading}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <ScrollView contentContainerStyle={styles.marketingContainer}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>{t.home.eyebrow}</Text>
          <Text style={styles.title}>Linkit</Text>
          <Text style={styles.subtitle}>{t.home.subtitle}</Text>
          <View style={styles.heroActions}>
            <Link href="/(auth)/register" style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{t.home.startFree}</Text>
            </Link>
            <Link href="/(auth)/login" style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>{t.home.login}</Text>
            </Link>
          </View>
        </View>

        <View style={styles.featureGrid}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.home.fastProfileSetup}</Text>
            <Text style={styles.cardText}>{t.home.fastProfileSetupText}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.home.madeForSharing}</Text>
            <Text style={styles.cardText}>{t.home.madeForSharingText}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.home.webAppReady}</Text>
            <Text style={styles.cardText}>{t.home.webAppReadyText}</Text>
          </View>
        </View>

        <View style={styles.footerLinks}>
          <Link href="/privacy" style={styles.footerLink}>
            <Text>{t.home.privacy}</Text>
          </Link>
          <Link href="/terms" style={styles.footerLink}>
            <Text>{t.home.terms}</Text>
          </Link>
          <Link href="/settings" style={styles.footerLink}>
            <Text>{t.common.settings}</Text>
          </Link>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.loggedInTitle}>{t.home.welcomeBack}</Text>
      <Link href="/profile/edit" style={styles.button}>
        <Text style={styles.buttonText}>{t.home.editProfile}</Text>
      </Link>
      <Link href="/profile/preview" style={styles.button}>
        <Text style={styles.buttonText}>{t.common.preview}</Text>
      </Link>
      <Link href="/settings" style={styles.button}>
        <Text style={styles.buttonText}>{t.common.settings}</Text>
      </Link>
      <TouchableOpacity style={styles.button} onPress={() => void logout()}>
        <Text style={styles.buttonText}>{t.home.logout}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  marketingContainer: {
    padding: 24,
    backgroundColor: '#F7F2EA',
  },
  hero: {
    backgroundColor: '#FFFDF8',
    borderRadius: 28,
    padding: 28,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E6DDCF',
  },
  eyebrow: {
    color: '#9B6B3E',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 16,
    color: '#1F1408',
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  loggedInTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5B4B3A',
    marginBottom: 24,
  },
  heroActions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#1F1408',
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#EEE4D6',
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1F1408',
    fontSize: 16,
    fontWeight: '700',
  },
  featureGrid: {
    gap: 16,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9E0D2',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1408',
    marginBottom: 8,
  },
  cardText: {
    color: '#5B4B3A',
    lineHeight: 22,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 24,
  },
  footerLink: {
    paddingVertical: 8,
  },
  button: {
    backgroundColor: '#000000',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
