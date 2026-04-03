import React, { useEffect, useState } from 'react';
import { ScrollView, Linking, StyleSheet, Text } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { useTranslation } from '../../src/i18n';
import ProfileHeader from '../../src/components/ProfileHeader';
import CTAButton from '../../src/components/CTAButton';
import TrustBlock from '../../src/components/TrustBlock';
import ServiceCardList from '../../src/components/ServiceCardList';
import LinkItemList from '../../src/components/LinkItemList';
import { useAuthStore } from '../../src/stores/authStore';
import { PublicProfile } from '../../src/types';
import { fetchPublicProfileByUserId, subscribeToProfileRealtime } from '../../src/utils/profile';

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

      <Text style={styles.publicUrl}>{t.profile.publicUrl}: /{profile.username}</Text>
      
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
  publicUrl: {
    textAlign: 'center',
    color: '#666666',
    marginBottom: 20,
  },
});
