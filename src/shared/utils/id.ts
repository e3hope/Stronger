/**
 * UI 리스트(운동/세트 아이템)의 클라이언트 측 임시 ID 생성기.
 * 서버 저장 전 로컬에서만 사용한다. 암호학적 안전성 없음 — DB PK 용도로는 사용 금지.
 */
export function tempId(): string {
  return Math.random().toString(36).substring(2, 11);
}
