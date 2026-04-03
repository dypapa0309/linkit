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
import { useProfileStore } from '../../src/stores/profileStore';
import { buildPublicProfile, fetchProfileByUserId } from '../../src/utils/profile';

export default function Preview() {
  const { t } = useTranslation();
  const initialized = useAuthStore((state) => state.initialized);
  const user = useAuthStore((state) => state.user);
  const profile = useProfileStore((state) => state.profile);
  const setProfile = useProfileStore((state) => state.setProfile);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!user || profile) {
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);

      try {
        const nextProfile = await fetchProfileByUserId(user.id);

        if (isMounted && nextProfile) {
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

    return () => {
      isMounted = false;
    };
  }, [profile, setProfile, t.profile.fetchError, user]);

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

  const publicProfile = buildPublicProfile(profile);

  if (!publicProfile) {
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
    if (publicProfile.cta_link) {
      Linking.openURL(publicProfile.cta_link);
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
      <ProfileHeader name={publicProfile.name || publicProfile.username} bio={publicProfile.bio} />
      
      <CTAButton text={publicProfile.cta_text || t.profile.contactMe} onPress={handleCTA} />
      
      <TrustBlock
        reviewCount={publicProfile.trust_review_count}
        responseTime={publicProfile.trust_response_time}
        reuseRate={publicProfile.trust_reuse_rate}
      />
      
      <ServiceCardList cards={publicProfile.serviceCards} onCardPress={handleCardPress} />
      
      <LinkItemList items={publicProfile.linkItems} onItemPress={handleLinkPress} />

      <Text style={styles.publicUrl}>{t.profile.publicUrl}: /public/{publicProfile.username}</Text>
      
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
