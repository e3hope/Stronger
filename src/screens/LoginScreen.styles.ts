import { StyleSheet } from 'react-native';
import { Colors } from '../colors';

export const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: Colors.background },
  title: { fontSize: 32, fontWeight: 'bold', color: Colors.text, textAlign: 'center', marginBottom: 40 },
  inputContainer: { gap: 12, marginBottom: 20 },
  input: { backgroundColor: Colors.card, color: Colors.text, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  buttonContainer: { gap: 12 },
  button: { backgroundColor: Colors.primary, padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: Colors.background, fontWeight: 'bold', fontSize: 16 },
  outlineButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.primary },
  outlineButtonText: { color: Colors.primary },
});
