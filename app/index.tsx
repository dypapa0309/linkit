import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
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
    if (Platform.OS !== 'web') {
      return (
        <View style={styles.appAuthContainer}>
          <Text style={styles.appTitle}>Linkit</Text>
          <Text style={styles.appSubtitle}>
            {t.home.subtitle}
          </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable style={styles.appPrimaryButton}>
              <Text style={styles.appPrimaryButtonText}>{t.home.startFree}</Text>
            </Pressable>
          </Link>
          <Link href="/(auth)/login" asChild>
            <Pressable style={styles.appSecondaryButton}>
              <Text style={styles.appSecondaryButtonText}>{t.home.login}</Text>
            </Pressable>
          </Link>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.marketingContainer}>
        <View style={styles.page}>
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.home.sampleProfile}</Text>
            <Text style={styles.sectionLead}>linkit-link.netlify.app/sangbin</Text>
            <Text style={styles.sectionText}>{t.home.sampleProfileText}</Text>
            <Link href="/public/sangbin" asChild>
              <Pressable style={styles.inlineButton}>
                <Text style={styles.inlineButtonText}>{t.home.openSample}</Text>
              </Pressable>
            </Link>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.home.madeForSharing}</Text>
            <Text style={styles.sectionText}>{t.home.madeForSharingText}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.home.fastProfileSetup}</Text>
            <Text style={styles.sectionText}>{t.home.fastProfileSetupText}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.home.webAppReady}</Text>
            <Text style={styles.sectionText}>{t.home.webAppReadyText}</Text>
          </View>

          <View style={styles.sectionAccent}>
            <Text style={styles.sectionTitle}>{t.home.ownerNote}</Text>
            <Text style={styles.sectionText}>{t.home.ownerNoteText}</Text>
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
    justifyContent: 'center',
  },
  page: {
    width: '100%',
    maxWidth: 920,
    alignSelf: 'center',
  },
  hero: {
    backgroundColor: '#FFFDF8',
    borderRadius: 28,
    padding: 40,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E6DDCF',
  },
  section: {
    backgroundColor: '#FFFDF8',
    borderRadius: 28,
    padding: 24,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E6DDCF',
  },
  sectionAccent: {
    backgroundColor: '#F2E3CF',
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2CEB4',
  },
  sectionTitle: {
    color: '#1F1408',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
  },
  sectionLead: {
    color: '#9B6B3E',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
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
    fontSize: 19,
    lineHeight: 30,
    color: '#5B4B3A',
    marginBottom: 24,
    maxWidth: 720,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  sectionText: {
    color: '#5B4B3A',
    lineHeight: 28,
    fontSize: 16,
  },
  inlineButton: {
    alignSelf: 'flex-start',
    marginTop: 18,
    backgroundColor: '#1F1408',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  inlineButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 32,
    paddingTop: 4,
  },
  footerLink: {
    paddingVertical: 8,
  },
  appAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#FFFDF8',
  },
  appTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1F1408',
    marginBottom: 14,
  },
  appSubtitle: {
    color: '#5B4B3A',
    lineHeight: 24,
    fontSize: 16,
    marginBottom: 24,
  },
  appPrimaryButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#1F1408',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  appSecondaryButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#EEE4D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appSecondaryButtonText: {
    color: '#1F1408',
    fontSize: 16,
    fontWeight: '700',
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
