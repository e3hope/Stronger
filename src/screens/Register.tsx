import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { styles } from './LoginScreen.styles';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signUpWithEmail() {
    if (loading) return;
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
    });
    setLoading(false);

    if (error) {
      if (error.message.includes('rate_limit')) {
        Alert.alert('오류', '이메일 전송 한도를 초과했습니다.\n잠시 후 다시 시도하거나 Supabase 설정에서 이메일 인증을 비활성화하세요.');
      } else if (error.message.includes('already registered')) {
        Alert.alert('알림', '이미 가입된 이메일입니다.\n로그인 페이지로 이동해 주세요.');
      } else {
        Alert.alert('Error', error.message);
      }
    }
    else Alert.alert('Success', '회원가입 완료! 이메일을 확인해주세요.');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
          autoCapitalize="none"
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={signUpWithEmail} disabled={loading}>
          {loading ? <ActivityIndicator color="#121212" /> : <Text style={styles.buttonText}>회원가입</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={() => router.back()} disabled={loading}>
          <Text style={[styles.buttonText, styles.outlineButtonText]}>로그인으로</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
