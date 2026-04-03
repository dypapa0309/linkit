import React from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '../src/i18n';
import { AppLanguage } from '../src/i18n/translations';
import { useAuthStore } from '../src/stores/authStore';
import { useLanguageStore } from '../src/stores/languageStore';
import { deleteMyAccount } from '../src/utils/auth';

export default function SettingsPage() {
  const { t, language } = useTranslation();
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const setSession = useAuthStore((state) => state.setSession);
  const [deleting, setDeleting] = React.useState(false);
  const router = useRouter();

  const options: { key: AppLanguage; label: string }[] = [
    { key: 'ko', label: t.common.korean },
    { key: 'en', label: t.common.english },
  ];

  const handleDeleteAccount = async () => {
    if (deleting) {
      return;
    }

    setDeleting(true);

    try {
      await deleteMyAccount();
      setSession(null);

      if (Platform.OS === 'web') {
        window.alert(t.settings.deleteAccountSuccess);
      } else {
        Alert.alert(t.settings.deleteAccountSuccess);
      }

      router.replace('/');
    } catch (error) {
      const message =
        error instanceof Error && error.message ? error.message : t.settings.deleteAccountError;

      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert(t.settings.deleteAccountError, message);
      }
    } finally {
      setDeleting(false);
    }
  };

  const confirmDeleteAccount = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(t.settings.deleteAccountConfirmMessage);

      if (confirmed) {
        void handleDeleteAccount();
      }

      return;
    }

    Alert.alert(
      t.settings.deleteAccountConfirmTitle,
      t.settings.deleteAccountConfirmMessage,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.settings.deleteAccount,
          style: 'destructive',
          onPress: () => {
            void handleDeleteAccount();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.settings.title}</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.settings.languageTitle}</Text>
        <Text style={styles.cardDescription}>{t.settings.languageDescription}</Text>
        <Text style={styles.currentLabel}>
          {t.settings.currentLanguage}: {language === 'ko' ? t.common.korean : t.common.english}
        </Text>

        {options.map((option) => {
          const selected = option.key === language;

          return (
            <Pressable
              key={option.key}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => void setLanguage(option.key)}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.card, styles.dangerCard]}>
        <Text style={styles.cardTitle}>{t.settings.accountTitle}</Text>
        <Text style={styles.cardDescription}>{t.settings.accountDescription}</Text>
        <Pressable
          style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
          onPress={confirmDeleteAccount}
          disabled={deleting}
        >
          <Text style={styles.deleteButtonText}>
            {deleting ? t.settings.deletingAccount : t.settings.deleteAccount}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FAF7F1',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F1408',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E9E0D2',
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F1408',
    marginBottom: 8,
  },
  cardDescription: {
    color: '#5B4B3A',
    lineHeight: 22,
    marginBottom: 12,
  },
  currentLabel: {
    color: '#9B6B3E',
    fontWeight: '600',
    marginBottom: 16,
  },
  option: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9E0D2',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  optionSelected: {
    backgroundColor: '#1F1408',
    borderColor: '#1F1408',
  },
  optionText: {
    color: '#1F1408',
    fontSize: 16,
    fontWeight: '700',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  dangerCard: {
    borderColor: '#F0D3D3',
  },
  deleteButton: {
    marginTop: 8,
    minHeight: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8F1D1D',
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
