import React, { useEffect, useState } from 'react';
import { ScrollView, Linking, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from '../../src/i18n';
import ProfileHeader from '../../src/components/ProfileHeader';
import CTAButton from '../../src/components/CTAButton';
import TrustBlock from '../../src/components/TrustBlock';
import ServiceCardList from '../../src/components/ServiceCardList';
import LinkItemList from '../../src/components/LinkItemList';
import { PublicProfile } from '../../src/types';
import { fetchProfileByUsername } from '../../src/utils/profile';

export default function PublicPage() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const username = String(params.username ?? 'anonymous');
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
          setErrorMessage(error instanceof Error ? error.message : '프로필을 불러오지 못했어요.');
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
  }, [username]);

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
    <ScrollView style={styles.container}>
      <ProfileHeader name={profile.name || profile.username} bio={profile.bio} />
      
      <CTAButton text={profile.cta_text || t.profile.contactMe} onPress={handleCTA} />
      
      <TrustBlock
        reviewCount={profile.trust_review_count}
        responseTime={profile.trust_response_time}
        reuseRate={profile.trust_reuse_rate}
      />
      
      <ServiceCardList cards={profile.serviceCards} onCardPress={handleCardPress} />
      
      <LinkItemList items={profile.linkItems} onItemPress={handleLinkPress} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  message: {
    padding: 20,
    textAlign: 'center',
  },
});
