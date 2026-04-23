import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../api/client';
import { styles } from './LoginScreen.styles';
import { Colors } from '../../colors';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signUpWithEmail() {
    if (loading) return;
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedPasswordConfirm = passwordConfirm.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해 주세요.');
      return;
    }

    if (trimmedPassword !== trimmedPasswordConfirm) {
      Alert.alert('오류', '비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: trimmedPassword,
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Text style={styles.title}>회원가입</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.textSecondary}
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry
          onChangeText={setPassword}
          value={password}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry
          onChangeText={setPasswordConfirm}
          value={passwordConfirm}
          autoCapitalize="none"
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={signUpWithEmail} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.background} /> : <Text style={styles.buttonText}>회원가입</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={() => router.back()} disabled={loading}>
          <Text style={[styles.buttonText, styles.outlineButtonText]}>로그인으로</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
