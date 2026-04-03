import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { useTranslation } from '../../src/i18n';
import { useAuthStore } from '../../src/stores/authStore';
import { useProfileStore } from '../../src/stores/profileStore';
import { LinkItem } from '../../src/types';
import {
  createLinkItem,
  deleteLinkItem,
  fetchLinkItemsByUserId,
  fetchProfileByUserId,
  getLinkItemSaveErrorMessage,
  getProfileSaveErrorMessage,
  normalizeExternalUrl,
  subscribeToProfileRealtime,
  upsertProfile,
} from '../../src/utils/profile';

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
  const [linkItems, setLinkItems] = useState<LinkItem[]>([]);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [linkMessage, setLinkMessage] = useState('');
  const [linkErrorMessage, setLinkErrorMessage] = useState('');

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);

      try {
        const [nextProfile, nextLinkItems] = await Promise.all([
          fetchProfileByUserId(user.id),
          fetchLinkItemsByUserId(user.id),
        ]);

        if (!isMounted || !nextProfile) {
          return;
        }

        setProfile(nextProfile);
        setLinkItems(nextLinkItems);
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
          cta_link: normalizeExternalUrl(ctaLink),
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

  const currentPlan = profile?.plan ?? 'free';
  const freeLinkLimitReached = currentPlan !== 'pro' && linkItems.length >= 3;

  const handleAddLink = async () => {
    if (!user) {
      return;
    }

    if (!linkTitle.trim() || !linkUrl.trim()) {
      setLinkErrorMessage(t.profile.linkRequired);
      return;
    }

    if (freeLinkLimitReached) {
      setLinkErrorMessage(t.profile.linkLimitReached);
      return;
    }

    setLinkLoading(true);
    setLinkMessage('');
    setLinkErrorMessage('');

    try {
      const nextLink = await createLinkItem({
        userId: user.id,
        title: linkTitle.trim(),
        link: normalizeExternalUrl(linkUrl),
        order: linkItems.length,
      });

      setLinkItems((current) => [...current, nextLink]);
      setLinkTitle('');
      setLinkUrl('');
      setLinkMessage(t.profile.linkSaved);
    } catch (error) {
      setLinkErrorMessage(getLinkItemSaveErrorMessage(error));
    } finally {
      setLinkLoading(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    setLinkLoading(true);
    setLinkMessage('');
    setLinkErrorMessage('');

    try {
      await deleteLinkItem(id);
      setLinkItems((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      setLinkErrorMessage(getLinkItemSaveErrorMessage(error));
    } finally {
      setLinkLoading(false);
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.profile.additionalLinks}</Text>
        <Text style={styles.helper}>
          {currentPlan === 'pro' ? t.profile.proLinksDescription : t.profile.freeLinksDescription}
        </Text>

        <View style={styles.planBadgeRow}>
          <Text style={styles.planBadge}>
            {currentPlan === 'pro' ? t.profile.proPlan : t.profile.freePlan}
          </Text>
          <Text style={styles.planMeta}>
            {currentPlan === 'pro'
              ? `${t.profile.connectedLinks} ${linkItems.length}`
              : `${linkItems.length}/3 ${t.profile.freePlanCount}`}
          </Text>
        </View>

        {linkItems.map((item) => (
          <View key={item.id} style={styles.linkCard}>
            <View style={styles.linkCardBody}>
              <Text style={styles.linkCardTitle}>{item.title}</Text>
              <Text style={styles.linkCardUrl}>{item.link}</Text>
            </View>
            <TouchableOpacity onPress={() => void handleDeleteLink(item.id)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>{t.profile.deleteLink}</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TextInput
          style={styles.input}
          placeholder={t.profile.linkTitle}
          value={linkTitle}
          onChangeText={setLinkTitle}
        />
        <TextInput
          style={styles.input}
          placeholder={t.profile.linkUrl}
          value={linkUrl}
          onChangeText={setLinkUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {freeLinkLimitReached ? <Text style={styles.limitText}>{t.profile.linkLimitReached}</Text> : null}
        {linkErrorMessage ? <Text style={styles.errorText}>{linkErrorMessage}</Text> : null}
        {linkMessage ? <Text style={styles.successText}>{linkMessage}</Text> : null}

        <TouchableOpacity
          style={[styles.secondaryActionButton, (linkLoading || freeLinkLimitReached) && styles.secondaryActionButtonDisabled]}
          onPress={() => void handleAddLink()}
          disabled={linkLoading || freeLinkLimitReached}
        >
          <Text style={styles.secondaryActionButtonText}>
            {linkLoading ? t.profile.saving : t.profile.addLink}
          </Text>
        </TouchableOpacity>

        {currentPlan !== 'pro' ? (
          <View style={styles.upgradeCard}>
            <Text style={styles.upgradeTitle}>{t.profile.upgradeTitle}</Text>
            <Text style={styles.upgradeDescription}>{t.profile.upgradeDescription}</Text>
            <Text style={styles.upgradeMeta}>{t.profile.upgradeComingSoon}</Text>
          </View>
        ) : null}
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
  planBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2E3CF',
    color: '#8B5A2B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    fontWeight: '700',
  },
  planMeta: {
    color: '#6C5B4B',
    fontWeight: '600',
  },
  linkCard: {
    borderWidth: 1,
    borderColor: '#E9E0D2',
    borderRadius: 16,
    backgroundColor: '#FFFCF7',
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkCardBody: {
    flex: 1,
  },
  linkCardTitle: {
    color: '#1F1408',
    fontWeight: '700',
    marginBottom: 4,
  },
  linkCardUrl: {
    color: '#6C5B4B',
    fontSize: 13,
  },
  deleteButton: {
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: '#F3E7DA',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#8B5A2B',
    fontWeight: '700',
  },
  secondaryActionButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#1F1408',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  secondaryActionButtonDisabled: {
    opacity: 0.55,
  },
  secondaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  limitText: {
    color: '#8B5A2B',
    marginBottom: 12,
  },
  upgradeCard: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: '#F7EFE4',
    borderWidth: 1,
    borderColor: '#E2D1BB',
    padding: 16,
  },
  upgradeTitle: {
    color: '#1F1408',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  upgradeDescription: {
    color: '#5B4B3A',
    lineHeight: 22,
  },
  upgradeMeta: {
    color: '#8B5A2B',
    marginTop: 10,
    fontWeight: '600',
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
