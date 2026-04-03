import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '../src/i18n';

const sections = [
  {
    title: 'What We Collect',
    body: 'We collect account information such as email, username, and profile content you choose to publish through Linkit.',
  },
  {
    title: 'How We Use It',
    body: 'We use this information to provide account access, host public profile pages, and help users manage and share their profile links.',
  },
  {
    title: 'Public Information',
    body: 'Your public profile content, including username, display name, bio, CTA text, and shared links, can be visible to anyone who visits your public page.',
  },
  {
    title: 'Contact',
    body: 'For privacy questions or deletion requests, provide a support email before launch and update this page with that address.',
  },
];

export default function PrivacyPage() {
  const { t } = useTranslation();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>{t.legal.kicker}</Text>
      <Text style={styles.title}>{t.legal.privacyTitle}</Text>
      <Text style={styles.intro}>{t.legal.privacyIntro}</Text>

      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionBody}>{section.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F1',
  },
  content: {
    padding: 24,
    maxWidth: 820,
    width: '100%',
    alignSelf: 'center',
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#9B6B3E',
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1F1408',
    marginBottom: 12,
  },
  intro: {
    color: '#5B4B3A',
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9E0D2',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1408',
    marginBottom: 8,
  },
  sectionBody: {
    color: '#5B4B3A',
    lineHeight: 22,
  },
});
