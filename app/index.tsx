import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Pressable } from 'react-native';
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
        <View style={styles.heroShell}>
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>{t.home.eyebrow}</Text>
            <Text style={styles.title}>Linkit</Text>
            <Text style={styles.subtitle}>{t.home.subtitle}</Text>
            <View style={styles.heroActions}>
              <Link href="/(auth)/register" asChild>
                <Pressable style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>{t.home.startFree}</Text>
                </Pressable>
              </Link>
              <Link href="/(auth)/login" asChild>
                <Pressable style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>{t.home.login}</Text>
                </Pressable>
              </Link>
            </View>
          </View>

          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>{t.home.sampleProfile}</Text>
            <Text style={styles.previewUrl}>linkit-link.netlify.app/sangbin</Text>
            <Text style={styles.previewText}>{t.home.sampleProfileText}</Text>
            <Link href="/public/sangbin" asChild>
              <Pressable style={styles.previewButton}>
                <Text style={styles.previewButtonText}>{t.home.openSample}</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <View style={styles.featureGrid}>
          <View style={styles.cardCompact}>
            <Text style={styles.cardTitle}>{t.home.fastProfileSetup}</Text>
            <Text style={styles.cardText}>{t.home.fastProfileSetupText}</Text>
          </View>
          <View style={styles.cardCompact}>
            <Text style={styles.cardTitle}>{t.home.madeForSharing}</Text>
            <Text style={styles.cardText}>{t.home.madeForSharingText}</Text>
          </View>
          <View style={styles.cardWide}>
            <Text style={styles.cardTitle}>{t.home.webAppReady}</Text>
            <Text style={styles.cardText}>{t.home.webAppReadyText}</Text>
          </View>
          <View style={styles.cardWideAccent}>
            <Text style={styles.cardTitle}>{t.home.ownerNote}</Text>
            <Text style={styles.cardText}>{t.home.ownerNoteText}</Text>
          </View>
        </View>

        <View style={styles.featureGrid}>
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
  heroShell: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'stretch',
    marginBottom: 18,
    flexWrap: 'wrap',
  },
  hero: {
    flex: 2,
    minWidth: 320,
    backgroundColor: '#FFFDF8',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: '#E6DDCF',
  },
  previewCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: '#1F1408',
    borderRadius: 28,
    padding: 24,
  },
  previewLabel: {
    color: '#E7C89E',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  previewUrl: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  previewText: {
    color: '#E4D7C7',
    lineHeight: 22,
    marginBottom: 20,
  },
  previewButton: {
    backgroundColor: '#F0E1CE',
    minHeight: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  previewButtonText: {
    color: '#1F1408',
    fontWeight: '700',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#1F1408',
    minHeight: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#EEE4D6',
    minHeight: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  secondaryButtonText: {
    color: '#1F1408',
    fontSize: 16,
    fontWeight: '700',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  cardCompact: {
    flexBasis: 280,
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9E0D2',
  },
  cardWide: {
    flexBasis: 420,
    flexGrow: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9E0D2',
  },
  cardWideAccent: {
    flexBasis: 420,
    flexGrow: 2,
    backgroundColor: '#F4E6D3',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2CEB4',
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
    width: '100%',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 24,
    marginTop: 4,
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
