// 폼 입력값 검사. 화면에서 먼저 검사하고, 저장할 때는 Firestore 규칙이 한 번 더 검사한다.
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** 010-1234-5678, 02-123-4567 처럼 숫자 9~11자리 */
export function isPhone(v: string) {
  const t = v.trim();
  const digits = t.replace(/\D/g, "");
  return /^[\d\s-]+$/.test(t) && digits.length >= 9 && digits.length <= 11;
}

export const VOLUMES = [
  { id: "under_10kg", label: "10kg 미만", note: "스타터 / 소형" },
  { id: "10_30kg", label: "10 ~ 30kg", note: "일반 카페" },
  { id: "30_50kg", label: "30 ~ 50kg", note: "중대형 / 회전율 높음" },
  { id: "over_50kg", label: "50kg 이상", note: "대형 / 멀티 지점" },
] as const;

export const STATUSES = ["현재 매장 운영 중", "오픈 준비 중 (1개월 이내)", "오픈 준비 중 (2~3개월 이내)", "기존 원두 교체 검토"] as const;
export const PROFILES = ["다크 초콜릿 & 너티", "플로럴 & 브라이트", "마운틴워터 디카페인"] as const;

export type Wholesale = { store: string; manager: string; phone: string; location: string; status: string; volume: string; profiles: string[]; message: string };
export type Errors<T> = Partial<Record<keyof T, string>>;

const LIMIT = { short: 50, message: 1000 };

export function validateWholesale(w: Wholesale): Errors<Wholesale> {
  const e: Errors<Wholesale> = {};
  const need = (k: "store" | "manager" | "location", label: string) => {
    const v = w[k].trim();
    if (!v) e[k] = `${label}을(를) 입력해 주세요.`;
    else if (v.length > LIMIT.short) e[k] = `${LIMIT.short}자 이내로 입력해 주세요.`;
  };
  need("store", "매장 상호명");
  need("manager", "담당자 성함");
  if (!isPhone(w.phone)) e.phone = "연락처를 010-0000-0000 형식으로 입력해 주세요.";
  need("location", "매장 위치");
  if (!(STATUSES as readonly string[]).includes(w.status)) e.status = "운영 현황을 골라 주세요.";
  if (!VOLUMES.some((v) => v.id === w.volume)) e.volume = "예상 월 사용량을 골라 주세요.";
  if (w.profiles.some((p) => !(PROFILES as readonly string[]).includes(p))) e.profiles = "목록에 있는 항목만 골라 주세요.";
  if (w.message.length > LIMIT.message) e.message = `${LIMIT.message}자 이내로 적어 주세요.`;
  return e;
}

/** 다음 n 번의 목요일(오늘이 목요일이면 다음 주부터). 날짜는 YYYY-MM-DD. */
export function nextThursdays(from: Date, n: number) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  d.setDate(d.getDate() + (((4 - d.getDay() + 7) % 7) || 7));
  return Array.from({ length: n }, (_, i) => {
    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i * 7);
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  });
}
