import { StyleSheet } from 'react-native';
import { Colors } from '../colors';

export const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#121212' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 40 },
  inputContainer: { gap: 12, marginBottom: 20 },
  input: { backgroundColor: '#1E1E1E', color: '#fff', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  buttonContainer: { gap: 12 },
  button: { backgroundColor: Colors.primary, padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#121212', fontWeight: 'bold', fontSize: 16 },
  outlineButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.primary },
  outlineButtonText: { color: Colors.primary },
});
