import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../api/client';
import { useRouter } from 'expo-router';
import { styles } from './LoginScreen.styles';
import { Colors } from '../../colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const passwordInputRef = React.useRef<TextInput>(null);

  async function signInWithEmail() {
    if (loading) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });
    setLoading(false);

    if (error) {
      let title = '로그인 실패';
      let message = error.message;

      if (error.message.includes('Invalid login credentials')) {
        message = '이메일 또는 비밀번호가 일치하지 않습니다.\n입력하신 내용을 다시 확인해 주세요.';
      } else if (error.message.includes('Email not confirmed')) {
        message = '이메일 인증이 완료되지 않았습니다.\n가입하신 이메일의 수신함을 확인해 주세요.';
      } else if (error.message.includes('rate limit')) {
        message = '너무 많은 시도가 있었습니다.\n잠시 후 다시 시도해 주세요.';
      }

      Alert.alert(title, message);
    } else {
      router.replace('/calendar');
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Text style={styles.title}>Stronger</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.textSecondary}
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          blurOnSubmit={false}
        />
        <TextInput
          ref={passwordInputRef}
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry
          onChangeText={setPassword}
          value={password}
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={signInWithEmail}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={signInWithEmail} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.background} /> : <Text style={styles.buttonText}>로그인</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={() => router.push('/register')} disabled={loading}>
          <Text style={[styles.buttonText, styles.outlineButtonText]}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
