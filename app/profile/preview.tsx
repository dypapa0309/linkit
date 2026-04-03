import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Linking, StyleSheet, Text, View } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from '../../src/i18n';
import ProfileHeader from '../../src/components/ProfileHeader';
import CTAButton from '../../src/components/CTAButton';
import TrustBlock from '../../src/components/TrustBlock';
import ServiceCardList from '../../src/components/ServiceCardList';
import LinkItemList from '../../src/components/LinkItemList';
import { useAuthStore } from '../../src/stores/authStore';
import { PublicProfile } from '../../src/types';
import {
  fetchPublicProfileByUserId,
  openableExternalUrl,
  subscribeToProfileRealtime,
} from '../../src/utils/profile';
import { getPublicProfileUrl } from '../../src/utils/urls';

export default function Preview() {
  const { t } = useTranslation();
  const initialized = useAuthStore((state) => state.initialized);
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copyMessage, setCopyMessage] = useState('');

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);

      try {
        const nextProfile = await fetchPublicProfileByUserId(user.id);

        if (isMounted) {
          setProfile(nextProfile);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : t.profile.fetchError);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadProfile();

    const unsubscribe = subscribeToProfileRealtime(user.id, () => {
      void loadProfile();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [t.profile.fetchError, user]);

  if (initialized && !user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (loading) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.message}>{t.common.loading}</Text>
      </ScrollView>
    );
  }

  if (!profile) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.message}>{errorMessage || t.profile.saveFirst}</Text>
        <Link href="/profile/edit" asChild>
          <Pressable style={styles.linkButton}>
            <Text style={styles.linkButtonText}>{t.common.edit}</Text>
          </Pressable>
        </Link>
      </ScrollView>
    );
  }

  const handleCTA = () => {
    if (profile.cta_link) {
      Linking.openURL(openableExternalUrl(profile.cta_link));
    }
  };

  const handleCardPress = (link: string) => {
    Linking.openURL(openableExternalUrl(link));
  };

  const handleLinkPress = (link: string) => {
    Linking.openURL(openableExternalUrl(link));
  };

  const publicProfileUrl = getPublicProfileUrl(profile.username);

  const handleCopyPublicUrl = async () => {
    await Clipboard.setStringAsync(publicProfileUrl);
    setCopyMessage(t.profile.publicUrlCopied);
    setTimeout(() => {
      setCopyMessage('');
    }, 1800);
  };

  const handleOpenPublicUrl = () => {
    Linking.openURL(publicProfileUrl);
  };

  return (
    <ScrollView style={styles.container}>
      <ProfileHeader name={profile.name || profile.username} bio={profile.bio} avatarUrl={profile.avatar_url} />
      {profile.cta_link ? (
        <CTAButton text={profile.cta_text || t.profile.visitPrimaryLink} onPress={handleCTA} />
      ) : null}
      <TrustBlock
        reviewCount={profile.trust_review_count}
        responseTime={profile.trust_response_time}
        reuseRate={profile.trust_reuse_rate}
      />
      <ServiceCardList cards={profile.serviceCards} onCardPress={handleCardPress} />
      <LinkItemList items={profile.linkItems} onItemPress={handleLinkPress} />

      <View style={styles.publicUrlRow}>
        <Text style={styles.publicUrlLabel}>{t.profile.publicUrl}</Text>
      </View>
      <Text style={styles.publicUrlValue}>{publicProfileUrl}</Text>
      <View style={styles.publicUrlActions}>
        <Pressable style={styles.publicActionButton} onPress={handleOpenPublicUrl}>
          <Ionicons name="open-outline" size={18} color="#1F1408" />
          <Text style={styles.publicActionText}>{t.profile.openPublicPage}</Text>
        </Pressable>
        <Pressable style={styles.publicActionButton} onPress={() => void handleCopyPublicUrl()}>
          <Ionicons name="copy-outline" size={18} color="#1F1408" />
          <Text style={styles.publicActionText}>{t.profile.copyAddress}</Text>
        </Pressable>
      </View>
      {copyMessage ? <Text style={styles.copyMessage}>{copyMessage}</Text> : null}

      <Link href="/profile/edit" asChild>
        <Pressable style={styles.linkButton}>
          <Text style={styles.linkButtonText}>{t.common.edit}</Text>
        </Pressable>
      </Link>
      <Link href="/settings" asChild>
        <Pressable style={styles.linkButton}>
          <Text style={styles.linkButtonText}>{t.common.settings}</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  linkButton: {
    alignSelf: 'center',
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  linkButtonText: {
    textAlign: 'center',
    color: '#1F1408',
    fontWeight: '600',
  },
  message: {
    padding: 20,
    textAlign: 'center',
  },
  publicUrlRow: {
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  publicUrlLabel: {
    color: '#666666',
    fontWeight: '600',
  },
  publicUrlValue: {
    textAlign: 'center',
    color: '#1F1408',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  publicUrlActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  publicActionButton: {
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: '#F3E7DA',
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  publicActionText: {
    color: '#1F1408',
    fontWeight: '600',
    fontSize: 13,
  },
  copyMessage: {
    textAlign: 'center',
    color: '#8B5A2B',
    marginBottom: 16,
    fontSize: 13,
    fontWeight: '600',
  },
});
