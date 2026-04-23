import { Alert, Platform } from 'react-native';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

/**
 * 플랫폼별 확인 다이얼로그 래퍼.
 * - web: `window.confirm`으로 message만 노출 (기존 동작 유지)
 * - native: `Alert.alert`로 title + message + 취소/확인 버튼
 * 확인 시 true, 취소 시 false를 resolve.
 */
export function confirm(opts: ConfirmOptions): Promise<boolean> {
  const {
    title,
    message,
    confirmLabel = '확인',
    cancelLabel = '취소',
    destructive = false,
  } = opts;

  if (Platform.OS === 'web') {
    const ok = typeof window !== 'undefined' && window.confirm(message);
    return Promise.resolve(Boolean(ok));
  }

  return new Promise<boolean>(resolve => {
    Alert.alert(title || '', message, [
      { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
      {
        text: confirmLabel,
        style: destructive ? 'destructive' : 'default',
        onPress: () => resolve(true),
      },
    ]);
  });
}
