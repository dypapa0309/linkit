import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Linking, StyleSheet, Text, View } from 'react-native';
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
import { fetchPublicProfileByUserId, subscribeToProfileRealtime } from '../../src/utils/profile';
import { getPublicProfileUrl } from '../../src/utils/urls';

export default function Preview() {
  const { t } = useTranslation();
  const initialized = useAuthStore((state) => state.initialized);
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
        <Link href="/profile/edit" style={styles.link}>
          <Text>{t.common.edit}</Text>
        </Link>
      </ScrollView>
    );
  }

  const handleCTA = () => {
    if (profile.cta_link) {
      Linking.openURL(profile.cta_link);
    }
  };

  const handleCardPress = (link: string) => {
    Linking.openURL(link);
  };

  const handleLinkPress = (link: string) => {
    Linking.openURL(link);
  };

  const publicProfileUrl = getPublicProfileUrl(profile.username);

  const handleCopyPublicUrl = async () => {
    await Clipboard.setStringAsync(publicProfileUrl);
    Alert.alert(t.common.copied, t.profile.publicUrlCopied);
  };

  return (
    <ScrollView style={styles.container}>
      <ProfileHeader name={profile.name || profile.username} bio={profile.bio} />
      
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
        <Pressable style={styles.copyButton} onPress={() => void handleCopyPublicUrl()}>
          <Ionicons name="copy-outline" size={18} color="#1F1408" />
        </Pressable>
      </View>
      <Text style={styles.publicUrlValue}>{publicProfileUrl}</Text>
      
      <Link href="/profile/edit" style={styles.link}>
        <Text>{t.common.edit}</Text>
      </Link>
      <Link href="/settings" style={styles.link}>
        <Text>{t.common.settings}</Text>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  link: {
    textAlign: 'center',
    marginBottom: 20,
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
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  copyButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F3E7DA',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
