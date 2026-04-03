import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, Redirect, useRouter } from 'expo-router';
import { useTranslation } from '../../src/i18n';
import { useAuthStore } from '../../src/stores/authStore';
import { signInWithGoogle } from '../../src/utils/auth';
import { ensureProfile } from '../../src/utils/profile';
import { supabase } from '../../src/utils/supabase';

export default function Login() {
  const { t } = useTranslation();
  const initialized = useAuthStore((state) => state.initialized);
  const user = useAuthStore((state) => state.user);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage(t.auth.missingLoginFields);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setLoading(false);
      setErrorMessage(error.message);
      return;
    }

    if (data.user) {
      try {
        await ensureProfile({
          userId: data.user.id,
          email: data.user.email ?? email.trim().toLowerCase(),
          username: (data.user.user_metadata?.username as string | undefined) ?? null,
          name: (data.user.user_metadata?.username as string | undefined) ?? null,
        });
      } catch (profileError) {
        setLoading(false);
        setErrorMessage(
          profileError instanceof Error ? profileError.message : t.auth.profileCreateError,
        );
        return;
      }
    }

    setLoading(false);

    router.replace('/profile/preview');
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMessage('');

    try {
      const session = await signInWithGoogle();

      if (session?.user) {
        router.replace('/profile/preview');
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
      <Text style={styles.title}>{t.auth.loginTitle}</Text>
      <TextInput
        style={styles.input}
        placeholder={t.auth.email}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder={t.auth.password}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={() => void handleLogin()} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? t.auth.loggingIn : t.auth.loginButton}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.googleButton}
        onPress={() => void handleGoogleLogin()}
        disabled={googleLoading}
      >
        <Text style={styles.googleButtonText}>
          {googleLoading ? t.auth.googleLoading : t.auth.continueWithGoogle}
        </Text>
      </TouchableOpacity>
      <Link href="/(auth)/register" style={styles.link}>
        <Text>{t.auth.noAccount}</Text>
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
});
