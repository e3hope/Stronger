import { StyleSheet } from 'react-native';
import { Colors } from '../../colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 0,
    marginBottom: 20,
    // Removed background color to blend with container
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  workoutList: {
    flex: 1,
    padding: 20,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  workoutCard: {
    backgroundColor: Colors.card,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  routineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  workoutStats: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  memoText: {
    color: '#aaa', // Keeping as is for now, or could map to textSecondary
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyText: {
    color: '#666', // Keeping as is for now
    textAlign: 'center',
    marginTop: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  addButtonText: {
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    maxHeight: '80%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDark,
  },
  modalItemText: {
    color: Colors.text,
    fontSize: 16,
  },
  closeButton: {
    marginTop: 15,
    padding: 15,
    backgroundColor: Colors.borderDark,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  customHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.background,
  },
  customHeaderTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  dayNamesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.background,
    paddingBottom: 10,
  },
  dayNameText: {
    color: Colors.calendarTextDefault,
    fontSize: 14,
    width: 32,
    textAlign: 'center',
  },
  containerListMode: {
    flex: 1,
    backgroundColor: Colors.pureBlack, // Pure Black
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  iconButton: {
    padding: 4,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  // Filter Tabs
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  filterTabActive: {
    backgroundColor: Colors.primary, // Sky Mint
    borderColor: Colors.primary,
  },
  filterTabText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: Colors.pureBlack,
    fontSize: 14,
    fontWeight: 'bold',
  },
  // List Card
  listCard: {
    backgroundColor: Colors.pureBlack, // Pure Black as requested
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.primary, // Sky Mint shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.primary, // Sky Mint border
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listDate: {
    color: Colors.primary, // Sky Mint accent
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  intensityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  intensityText: {
    color: Colors.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  listTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContent: {
    gap: 8,
  },
  listExerciseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary, // Sky Mint
    marginTop: 8,
    marginRight: 8,
  },
  listExerciseText: {
    color: Colors.textSecondary, // Grey for exercise details
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  boldText: {
    fontWeight: 'bold',
    color: Colors.textLightGrey, // Lighter grey for exercise name
  },
  divider: {
    height: 1,
    backgroundColor: Colors.primary, // Sky Mint
    marginVertical: 16,
    opacity: 0.3, 
  },
  listMemo: {
    color: Colors.textSecondary, // Grey for memo
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary, // Sky Mint
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});
