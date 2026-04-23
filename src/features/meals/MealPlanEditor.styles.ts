import { StyleSheet } from 'react-native';
import { Colors } from '../../colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerIconButton: {
    padding: 6,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerDoneButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
  },
  headerDoneText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  daySelector: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 4,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.overlayLight,
  },
  dayButtonActive: {
    backgroundColor: Colors.primary,
  },
  dayButtonText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  dayButtonTextActive: {
    color: Colors.background,
    fontWeight: 'bold',
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    marginTop: 8,
    marginBottom: 16,
  },
  copyButtonText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  sectionEmpty: {
    color: Colors.textSecondary,
    fontStyle: 'italic',
    fontSize: 12,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  itemInput: {
    flex: 1,
    backgroundColor: Colors.card,
    color: Colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  itemRemove: {
    padding: 8,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    alignSelf: 'flex-start',
  },
  addItemText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  footerSpacer: {
    height: 40,
  },
});
