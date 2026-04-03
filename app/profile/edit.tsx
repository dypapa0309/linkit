import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { Link, Redirect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
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
  updateLinkItem,
  uploadAvatar,
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
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<{ uri: string; mimeType?: string | null; fileSize?: number | null } | null>(null);
  const [linkItems, setLinkItems] = useState<LinkItem[]>([]);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
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
    setAvatarUrl(profile.avatar_url);
  }, [profile]);

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    if ((asset.fileSize ?? 0) > 5 * 1024 * 1024) {
      setErrorMessage(t.profile.avatarSizeError);
      return;
    }

    setSelectedAvatar({
      uri: asset.uri,
      mimeType: asset.mimeType,
      fileSize: asset.fileSize,
    });
    setAvatarUrl(asset.uri);
    setErrorMessage('');
  };

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
      let nextAvatarUrl = avatarUrl;

      if (selectedAvatar) {
        nextAvatarUrl = await uploadAvatar({
          userId: user.id,
          uri: selectedAvatar.uri,
          mimeType: selectedAvatar.mimeType,
        });
      }

      const nextProfile = await upsertProfile({
        userId: user.id,
        username: trimmedUsername,
        updates: {
          name: name.trim() || trimmedUsername,
          bio: bio.trim(),
          avatar_url: nextAvatarUrl,
          cta_text: ctaText.trim(),
          cta_link: normalizeExternalUrl(ctaLink),
        },
      });

      setProfile(nextProfile);
      setAvatarUrl(nextProfile.avatar_url);
      setSelectedAvatar(null);
      setMessage(t.profile.saved);
    } catch (error) {
      setErrorMessage(getProfileSaveErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = profile?.plan ?? 'free';
  const freeLinkLimitReached = currentPlan !== 'pro' && linkItems.length >= 3;
  const linkSubmitDisabled = linkLoading || (!editingLinkId && freeLinkLimitReached);

  const resetLinkForm = () => {
    setEditingLinkId(null);
    setLinkTitle('');
    setLinkDescription('');
    setLinkUrl('');
  };

  const handleEditLink = (item: LinkItem) => {
    setEditingLinkId(item.id);
    setLinkTitle(item.title);
    setLinkDescription(item.description ?? '');
    setLinkUrl(item.link);
    setLinkMessage('');
    setLinkErrorMessage('');
  };

  const handleAddLink = async () => {
    if (!user) {
      return;
    }

    if (!linkTitle.trim() || !linkUrl.trim()) {
      setLinkErrorMessage(t.profile.linkRequired);
      return;
    }

    if (!editingLinkId && freeLinkLimitReached) {
      setLinkErrorMessage(t.profile.linkLimitReached);
      return;
    }

    setLinkLoading(true);
    setLinkMessage('');
    setLinkErrorMessage('');

    try {
      if (editingLinkId) {
        const nextLink = await updateLinkItem({
          id: editingLinkId,
          title: linkTitle.trim(),
          description: linkDescription.trim(),
          link: normalizeExternalUrl(linkUrl),
        });

        setLinkItems((current) => current.map((item) => (item.id === editingLinkId ? nextLink : item)));
        setLinkMessage(t.profile.linkUpdated);
      } else {
        const nextLink = await createLinkItem({
          userId: user.id,
          title: linkTitle.trim(),
          description: linkDescription.trim(),
          link: normalizeExternalUrl(linkUrl),
          order: linkItems.length,
        });

        setLinkItems((current) => [...current, nextLink]);
        setLinkMessage(t.profile.linkSaved);
      }

      resetLinkForm();
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
      if (editingLinkId === id) {
        resetLinkForm();
      }
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.formShell}>
        <Text style={styles.title}>{t.profile.editProfile}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.profile.avatar}</Text>
          <Text style={styles.helper}>{t.profile.avatarDescription}</Text>
          <View style={styles.avatarRow}>
            {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.avatarPreview} /> : <View style={styles.avatarPlaceholder} />}
            <TouchableOpacity style={styles.secondaryActionButton} onPress={() => void handlePickAvatar()}>
              <Text style={styles.secondaryActionButtonText}>{t.profile.uploadAvatar}</Text>
            </TouchableOpacity>
          </View>
        </View>

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
                {item.description ? <Text style={styles.linkCardDescription}>{item.description}</Text> : null}
                <Text style={styles.linkCardUrl}>{item.link}</Text>
              </View>
              <View style={styles.linkCardActions}>
                <TouchableOpacity
                  onPress={() => handleEditLink(item)}
                  style={styles.editButton}
                >
                  <Text style={styles.editButtonText}>{t.profile.editLink}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => void handleDeleteLink(item.id)} style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>{t.profile.deleteLink}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {editingLinkId ? <Text style={styles.editingLabel}>{t.profile.editingLink}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder={t.profile.linkTitle}
            value={linkTitle}
            onChangeText={setLinkTitle}
          />
          <TextInput
            style={styles.input}
            placeholder={t.profile.linkDescription}
            value={linkDescription}
            onChangeText={(value) => setLinkDescription(value.slice(0, 20))}
            maxLength={20}
          />
          <TextInput
            style={styles.input}
            placeholder={t.profile.linkUrl}
            value={linkUrl}
            onChangeText={setLinkUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {!editingLinkId && freeLinkLimitReached ? <Text style={styles.limitText}>{t.profile.linkLimitReached}</Text> : null}
          {linkErrorMessage ? <Text style={styles.errorText}>{linkErrorMessage}</Text> : null}
          {linkMessage ? <Text style={styles.successText}>{linkMessage}</Text> : null}

          <TouchableOpacity
            style={[styles.secondaryActionButton, linkSubmitDisabled && styles.secondaryActionButtonDisabled]}
            onPress={() => void handleAddLink()}
            disabled={linkSubmitDisabled}
          >
            <Text style={styles.secondaryActionButtonText}>
              {linkLoading ? t.profile.saving : editingLinkId ? t.common.save : t.profile.addLink}
            </Text>
          </TouchableOpacity>
          {editingLinkId ? (
            <TouchableOpacity
              style={styles.linkCancelButton}
              onPress={resetLinkForm}
              disabled={linkLoading}
            >
              <Text style={styles.linkCancelButtonText}>{t.common.cancel}</Text>
            </TouchableOpacity>
          ) : null}

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

        <Link href="/profile/preview" asChild>
          <Pressable style={styles.linkButton}>
            <Text style={styles.linkButtonText}>{t.common.preview}</Text>
          </Pressable>
        </Link>
        <Link href="/settings" asChild>
          <Pressable style={styles.linkButton}>
            <Text style={styles.linkButtonText}>{t.common.settings}</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F1',
  },
  content: {
    padding: 20,
  },
  formShell: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  avatarPreview: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEEEEE',
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEEEEE',
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
  linkCardActions: {
    gap: 8,
  },
  linkCardTitle: {
    color: '#1F1408',
    fontWeight: '700',
    marginBottom: 4,
  },
  linkCardDescription: {
    color: '#8B5A2B',
    fontSize: 12,
    marginBottom: 4,
  },
  linkCardUrl: {
    color: '#6C5B4B',
    fontSize: 13,
  },
  editButton: {
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: '#1F1408',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
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
    paddingHorizontal: 16,
  },
  secondaryActionButtonDisabled: {
    opacity: 0.55,
  },
  secondaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  linkCancelButton: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9CBB9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  linkCancelButtonText: {
    color: '#6C5B4B',
    fontSize: 15,
    fontWeight: '600',
  },
  editingLabel: {
    color: '#8B5A2B',
    fontWeight: '700',
    marginBottom: 10,
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
  linkButton: {
    alignSelf: 'center',
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  linkButtonText: {
    textAlign: 'center',
    color: '#1F1408',
    fontWeight: '600',
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
