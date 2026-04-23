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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 8,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weekNavButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: Colors.overlayLight,
  },
  weekRangeText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    minWidth: 150,
    textAlign: 'center',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
  },
  gridWrapper: {
    flex: 1,
    paddingHorizontal: 8,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  dayHeaderCorner: {
    width: 44,
  },
  dayHeaderCell: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  dayHeaderText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  dayHeaderDateText: {
    color: Colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  dayHeaderToday: {
    color: Colors.primary,
  },
  dayHeaderSunday: {
    color: Colors.danger,
  },
  dayHeaderSaturday: {
    color: Colors.calendarSaturday,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.borderDark,
  },
  mealTypeCell: {
    width: 44,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.overlayLight,
  },
  mealTypeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  dayCell: {
    flex: 1,
    padding: 6,
    minHeight: 70,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: Colors.borderDark,
    justifyContent: 'flex-start',
  },
  dayCellLogged: {
    backgroundColor: '#FFB84D14',
  },
  dayCellBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 2,
    minHeight: 12,
  },
  rateBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: Colors.primaryLight,
  },
  rateBadgeText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  progressBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: Colors.overlayLight,
  },
  progressBadgeText: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
  },
  itemLineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 3,
    marginBottom: 1,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 4,
  },
  statusDotOk: {
    backgroundColor: Colors.primary,
  },
  statusDotSkip: {
    backgroundColor: Colors.danger,
  },
  statusDotSpacer: {
    width: 5,
    height: 5,
    marginTop: 4,
  },
  dayCellText: {
    flex: 1,
    color: Colors.text,
    fontSize: 10,
    lineHeight: 13,
  },
  dayCellTextSkip: {
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  dayCellEmptyText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: Colors.primary,
  },
  emptyCtaText: {
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
