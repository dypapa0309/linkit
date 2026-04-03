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

          <View style={styles.minimalPanel}>
            <View style={styles.sampleRow}>
              <View style={styles.sampleCopy}>
                <Text style={styles.sampleTitle}>{t.home.sampleProfile}</Text>
                <Text style={styles.sampleUrl}>linkit-link.netlify.app/sangbin</Text>
                <Text style={styles.sampleText}>{t.home.sampleProfileText}</Text>
              </View>
              <Link href="/public/sangbin" asChild>
                <Pressable style={styles.inlineButton}>
                  <Text style={styles.inlineButtonText}>{t.home.openSample}</Text>
                </Pressable>
              </Link>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryTitle}>{t.home.madeForSharing}</Text>
                <Text style={styles.summaryText}>{t.home.madeForSharingText}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryTitle}>{t.home.webAppReady}</Text>
                <Text style={styles.summaryText}>{t.home.webAppReadyText}</Text>
              </View>
            </View>

            <View style={styles.ownerNote}>
              <Text style={styles.ownerNoteTitle}>{t.home.ownerNote}</Text>
              <Text style={styles.ownerNoteText}>{t.home.ownerNoteText}</Text>
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
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.loggedInTitle}>{t.home.welcomeBack}</Text>
      <View style={styles.loggedInActions}>
        <Link href="/profile/edit" asChild>
          <Pressable style={styles.dashboardButton}>
            <Text style={styles.dashboardButtonText}>{t.home.editProfile}</Text>
          </Pressable>
        </Link>
        <Link href="/profile/preview" asChild>
          <Pressable style={styles.dashboardButton}>
            <Text style={styles.dashboardButtonText}>{t.common.preview}</Text>
          </Pressable>
        </Link>
        <Link href="/settings" asChild>
          <Pressable style={styles.dashboardButton}>
            <Text style={styles.dashboardButtonText}>{t.common.settings}</Text>
          </Pressable>
        </Link>
        <TouchableOpacity style={styles.dashboardButton} onPress={() => void logout()}>
          <Text style={styles.dashboardButtonText}>{t.home.logout}</Text>
        </TouchableOpacity>
      </View>
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
    maxWidth: 980,
    alignSelf: 'center',
  },
  hero: {
    backgroundColor: '#FCF8F0',
    borderRadius: 32,
    paddingVertical: 64,
    paddingHorizontal: 40,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6DDCF',
    alignItems: 'center',
  },
  minimalPanel: {
    backgroundColor: '#FFFDF8',
    borderRadius: 28,
    padding: 28,
    marginBottom: 18,
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
    fontSize: 56,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 18,
    color: '#1F1408',
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  loggedInTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
    color: '#1F1408',
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 30,
    color: '#5B4B3A',
    marginBottom: 28,
    maxWidth: 700,
    textAlign: 'center',
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
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
  inlineButton: {
    minHeight: 52,
    backgroundColor: '#1F1408',
    borderRadius: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
  },
  sampleCopy: {
    flex: 1,
  },
  sampleTitle: {
    color: '#8B5A2B',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sampleUrl: {
    color: '#1F1408',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  sampleText: {
    color: '#5B4B3A',
    fontSize: 15,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8DDCF',
    marginVertical: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 20,
  },
  summaryItem: {
    flex: 1,
  },
  summaryTitle: {
    color: '#1F1408',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  summaryText: {
    color: '#5B4B3A',
    fontSize: 15,
    lineHeight: 24,
  },
  ownerNote: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8DDCF',
  },
  ownerNoteTitle: {
    color: '#1F1408',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  ownerNoteText: {
    color: '#5B4B3A',
    lineHeight: 24,
    fontSize: 15,
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
  loggedInActions: {
    width: '100%',
    maxWidth: 260,
    alignItems: 'center',
  },
  dashboardButton: {
    width: '100%',
    minHeight: 56,
    backgroundColor: '#1F1408',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 18,
  },
  dashboardButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
