import React, { useEffect, useState } from 'react';
import { ScrollView, Linking, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '../i18n';
import ProfileHeader from '../components/ProfileHeader';
import CTAButton from '../components/CTAButton';
import TrustBlock from '../components/TrustBlock';
import ServiceCardList from '../components/ServiceCardList';
import LinkItemList from '../components/LinkItemList';
import { PublicProfile } from '../types';
import { fetchProfileByUsername } from '../utils/profile';

interface PublicProfileScreenProps {
  username: string;
}

export default function PublicProfileScreen({ username }: PublicProfileScreenProps) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const nextProfile = await fetchProfileByUsername(username);

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

    return () => {
      isMounted = false;
    };
  }, [t.profile.fetchError, username]);

  if (loading) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.message}>{t.common.loading}</Text>
      </ScrollView>
    );
  }

  if (!profile) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.message}>{errorMessage || t.publicPage.notFound}</Text>
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.shell}>
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F1E8',
  },
  content: {
    padding: 20,
  },
  shell: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    backgroundColor: '#FFFDF8',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E5DAC6',
    overflow: 'hidden',
    paddingBottom: 24,
  },
  message: {
    textAlign: 'center',
    color: '#5B4B3A',
    paddingVertical: 40,
  },
});
