import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '../src/i18n';

const sections = [
  {
    title: 'Service Overview',
    body: 'Linkit helps users create and publish profile pages with links, CTAs, and profile content.',
  },
  {
    title: 'User Responsibilities',
    body: 'You are responsible for the content, links, and information published through your account, and for keeping your login credentials secure.',
  },
  {
    title: 'Acceptable Use',
    body: 'Do not use the service for unlawful content, impersonation, spam, malicious redirects, or any activity that harms other users or visitors.',
  },
  {
    title: 'Changes and Termination',
    body: 'We may update, suspend, or remove parts of the service as the product evolves. Update this section with your company policy before public launch.',
  },
];

export default function TermsPage() {
  const { t } = useTranslation();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>{t.legal.kicker}</Text>
      <Text style={styles.title}>{t.legal.termsTitle}</Text>
      <Text style={styles.intro}>{t.legal.termsIntro}</Text>

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
