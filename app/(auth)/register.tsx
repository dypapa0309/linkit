import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, Redirect, useRouter } from 'expo-router';
import { useTranslation } from '../../src/i18n';
import { useAuthStore } from '../../src/stores/authStore';
import { getAuthRedirectUrl, signInWithGoogle } from '../../src/utils/auth';
import { supabase } from '../../src/utils/supabase';

export default function Register() {
  const { t } = useTranslation();
  const initialized = useAuthStore((state) => state.initialized);
  const user = useAuthStore((state) => state.user);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !username.trim()) {
      setErrorMessage(t.auth.missingRegisterFields);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
        data: {
          username: normalizedUsername,
        },
      },
    });

    if (error) {
      setLoading(false);
      setErrorMessage(error.message);
      return;
    }

    setLoading(false);

    if (data.session) {
      router.replace('/profile/edit');
      return;
    }

    setSuccessMessage(t.auth.emailConfirmationSent);
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const session = await signInWithGoogle();

      if (session?.user) {
        router.replace('/profile/edit');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t.auth.googleLoginError);
    } finally {
      setGoogleLoading(false);
    }
  };

  if (initialized && user) {
    return <Redirect href="/profile/preview" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.auth.registerTitle}</Text>
      <TextInput
        style={styles.input}
        placeholder={t.auth.email}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder={t.auth.username}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder={t.auth.password}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={() => void handleRegister()} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? t.auth.creating : t.auth.registerButton}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.googleButton}
        onPress={() => void handleGoogleRegister()}
        disabled={googleLoading}
      >
        <Text style={styles.googleButtonText}>
          {googleLoading ? t.auth.googleLoading : t.auth.continueWithGoogle}
        </Text>
      </TouchableOpacity>
      <Link href="/(auth)/login" style={styles.link}>
        <Text>{t.auth.hasAccount}</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
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
    marginBottom: 20,
  },
  googleButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DADADA',
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButtonText: {
    color: '#1F1408',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
  },
  errorText: {
    color: '#C62828',
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    color: '#2E7D32',
    marginBottom: 12,
    textAlign: 'center',
  },
});
