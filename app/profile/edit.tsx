import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { useTranslation } from '../../src/i18n';
import { useAuthStore } from '../../src/stores/authStore';
import { useProfileStore } from '../../src/stores/profileStore';
import { fetchProfileByUserId, getProfileSaveErrorMessage, upsertProfile } from '../../src/utils/profile';

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
  }, [profile]);

  const handleSave = async () => {
    if (!user) {
      return;
    }

    const trimmedUsername = username.trim().toLowerCase();

    if (!trimmedUsername) {
      setErrorMessage(t.profile.publicUsernameRequired);
      return;
    }

    if (/\s/.test(trimmedUsername)) {
      setErrorMessage(t.profile.usernameRule);
      return;
    }

    setLoading(true);
    setMessage('');
    setErrorMessage('');

    try {
      const nextProfile = await upsertProfile({
        userId: user.id,
        username: trimmedUsername,
        updates: {
          name: name.trim() || trimmedUsername,
          bio: bio.trim(),
          cta_text: ctaText.trim(),
          cta_link: ctaLink.trim(),
        },
      });

      setProfile(nextProfile);
      setMessage(t.profile.saved);
    } catch (error) {
      setErrorMessage(getProfileSaveErrorMessage(error));
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.profile.publicLinkTitle}</Text>
        <Text style={styles.helper}>{t.profile.publicLinkDescription}</Text>
        <TextInput
          style={styles.input}
          placeholder={t.auth.username}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.profile.name}</Text>
        <Text style={styles.helper}>{t.profile.displayNameDescription}</Text>
        <TextInput style={styles.input} placeholder={t.profile.name} value={name} onChangeText={setName} />

        <Text style={styles.sectionTitle}>{t.profile.bio}</Text>
        <Text style={styles.helper}>{t.profile.bioDescription}</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder={t.profile.bio}
          value={bio}
          onChangeText={setBio}
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.profile.cta}</Text>
        <Text style={styles.helper}>{t.profile.primaryButtonDescription}</Text>
        <TextInput
          style={styles.input}
          placeholder={t.profile.ctaText}
          value={ctaText}
          onChangeText={setCtaText}
        />
        <TextInput
          style={styles.input}
          placeholder={t.profile.ctaLink}
          value={ctaLink}
          onChangeText={setCtaLink}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

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
    backgroundColor: '#FAF7F1',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
    color: '#1F1408',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9E0D2',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#1F1408',
  },
  helper: {
    color: '#6C5B4B',
    lineHeight: 22,
    marginBottom: 12,
  },
  input: {
    minHeight: 52,
    borderColor: '#E9E0D2',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    backgroundColor: '#FFFCF7',
  },
  multilineInput: {
    minHeight: 110,
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
    marginTop: 16,
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
