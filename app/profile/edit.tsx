import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { useTranslation } from '../../src/i18n';
import { useAuthStore } from '../../src/stores/authStore';
import { useProfileStore } from '../../src/stores/profileStore';
import { fetchProfileByUserId, upsertProfile } from '../../src/utils/profile';

export default function EditProfile() {
  const { t } = useTranslation();
  const initialized = useAuthStore((state) => state.initialized);
  const user = useAuthStore((state) => state.user);
  const profile = useProfileStore((state) => state.profile);
  const setProfile = useProfileStore((state) => state.setProfile);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [trustReviewCount, setTrustReviewCount] = useState('');
  const [trustResponseTime, setTrustResponseTime] = useState('');
  const [trustReuseRate, setTrustReuseRate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);

      try {
        const nextProfile = await fetchProfileByUserId(user.id);

        if (!isMounted || !nextProfile) {
          return;
        }

        setProfile(nextProfile);
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
  }, [setProfile, t.profile.fetchError, user]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setName(profile.name);
    setUsername(profile.username);
    setBio(profile.bio);
    setCtaText(profile.cta_text);
    setCtaLink(profile.cta_link);
    setTrustReviewCount(String(profile.trust_review_count));
    setTrustResponseTime(profile.trust_response_time);
    setTrustReuseRate(profile.trust_reuse_rate);
  }, [profile]);

  const handleSave = async () => {
    if (!user) {
      return;
    }

    if (!username.trim()) {
      setErrorMessage(t.profile.publicUsernameRequired);
      return;
    }

    setLoading(true);
    setMessage('');
    setErrorMessage('');

    try {
      const nextProfile = await upsertProfile({
        userId: user.id,
        username: username.trim().toLowerCase(),
        updates: {
          name: name.trim(),
          bio: bio.trim(),
          cta_text: ctaText.trim(),
          cta_link: ctaLink.trim(),
          trust_review_count: Number(trustReviewCount || 0),
          trust_response_time: trustResponseTime.trim(),
          trust_reuse_rate: trustReuseRate.trim(),
        },
      });

      setProfile(nextProfile);
      setMessage(t.profile.saved);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t.profile.saveError);
    } finally {
      setLoading(false);
    }
  };

  if (initialized && !user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t.profile.editProfile}</Text>
      
      <Text style={styles.sectionTitle}>{t.profile.profile}</Text>
      <TextInput style={styles.input} placeholder={t.auth.username} value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder={t.profile.name} value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder={t.profile.bio} value={bio} onChangeText={setBio} multiline />
      
      <Text style={styles.sectionTitle}>{t.profile.cta}</Text>
      <TextInput style={styles.input} placeholder={t.profile.ctaText} value={ctaText} onChangeText={setCtaText} />
      <TextInput style={styles.input} placeholder={t.profile.ctaLink} value={ctaLink} onChangeText={setCtaLink} />
      
      <Text style={styles.sectionTitle}>{t.profile.trustData}</Text>
      <TextInput style={styles.input} placeholder={t.profile.reviewCount} value={trustReviewCount} onChangeText={setTrustReviewCount} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder={t.profile.responseTime} value={trustResponseTime} onChangeText={setTrustResponseTime} />
      <TextInput style={styles.input} placeholder={t.profile.reuseRate} value={trustReuseRate} onChangeText={setTrustReuseRate} />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {message ? <Text style={styles.successText}>{message}</Text> : null}
      
      <TouchableOpacity style={styles.button} onPress={() => void handleSave()} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? t.profile.saving : t.profile.saveProfile}</Text>
      </TouchableOpacity>
      
      <Link href="/profile/preview" style={styles.link}>
        <Text>{t.common.preview}</Text>
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
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    height: 52,
    borderColor: '#EEEEEE',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#000000',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: '#C62828',
    marginTop: 12,
    textAlign: 'center',
  },
  successText: {
    color: '#2E7D32',
    marginTop: 12,
    textAlign: 'center',
  },
});
