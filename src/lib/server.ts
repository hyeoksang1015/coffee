// Cloudflare Pages Functions(functions/api) 전용. 브라우저 코드에서 가져오지 않는다.
// 비밀값(토스 시크릿 키, 서버 계정 비밀번호)은 Cloudflare 환경 변수로만 받는다. 로컬은 .dev.vars.
export type Env = {
  TOSS_SECRET_KEY: string;
  FIREBASE_API_KEY: string;
  FIREBASE_PROJECT_ID: string;
  LW_SERVER_EMAIL: string;
  LW_SERVER_PASSWORD: string;
  ADMIN_UIDS: string;
};

export const json = (data: unknown, status = 200) => Response.json(data, { status });

type Handler = (ctx: { request: Request; env: Env }) => Promise<Response>;
/** 예상 못 한 오류도 스택 대신 JSON 메시지로 돌려준다. 자세한 내용은 Cloudflare 로그에 남긴다. */
export const handle = (fn: Handler): Handler => async (ctx) => {
  try {
    return await fn(ctx);
  } catch (e) {
    console.error(e);
    return json({ message: "서버 오류로 처리하지 못했습니다. 잠시 후 다시 시도해 주세요." }, 500);
  }
};

export const ORDER_ID = /^[A-Za-z0-9_-]{6,64}$/;

const identity = (env: Env, action: string, body: unknown) =>
  fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${env.FIREBASE_API_KEY}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json() as Promise<Record<string, unknown>>);

/** 서버 계정으로 로그인한 토큰. Firestore 규칙이 이 계정에만 결제 상태 변경을 허락한다. */
export async function serverToken(env: Env) {
  const r = await identity(env, "signInWithPassword", { email: env.LW_SERVER_EMAIL, password: env.LW_SERVER_PASSWORD, returnSecureToken: true });
  if (typeof r.idToken !== "string") throw new Error("서버 계정 로그인 실패");
  return r.idToken;
}

/** 요청한 사람의 Firebase 로그인 토큰을 확인해 uid 를 돌려준다. 잘못된 토큰이면 null. */
export async function callerUid(env: Env, request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) return null;
  const r = await identity(env, "lookup", { idToken: token });
  return (r.users as { localId: string }[] | undefined)?.[0]?.localId ?? null;
}

// ── Firestore REST: 값 변환
type Value = Record<string, unknown>;
function toValue(v: unknown): Value {
  if (v === null || v === undefined) return { nullValue: null };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  return { mapValue: { fields: toFields(v as Record<string, unknown>) } };
}
const toFields = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, toValue(v)]));

function fromValue(v: Value): unknown {
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("arrayValue" in v) return ((v.arrayValue as { values?: Value[] }).values ?? []).map(fromValue);
  if ("mapValue" in v) return fromFields((v.mapValue as { fields?: Record<string, Value> }).fields ?? {});
  return Object.values(v)[0];
}
export const fromFields = (f: Record<string, Value>) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, fromValue(v)]));
export { toFields };

const docUrl = (env: Env, path: string) => `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${path}`;

export async function getDoc(env: Env, token: string, path: string) {
  const r = await fetch(docUrl(env, path), { headers: { authorization: `Bearer ${token}` } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Firestore 읽기 실패 ${r.status}`);
  return fromFields(((await r.json()) as { fields: Record<string, Value> }).fields) as Record<string, unknown>;
}

/** 넘긴 필드만 바꾼다(updateMask). 없는 문서는 만들지 않는다. */
export async function patchDoc(env: Env, token: string, path: string, data: Record<string, unknown>) {
  const mask = Object.keys(data).map((k) => `updateMask.fieldPaths=${k}`).join("&");
  const r = await fetch(`${docUrl(env, path)}?${mask}&currentDocument.exists=true`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ fields: toFields(data) }),
  });
  if (!r.ok) throw new Error(`Firestore 쓰기 실패 ${r.status}`);
}

export async function toss(env: Env, path: string, body: unknown) {
  const r = await fetch(`https://api.tosspayments.com${path}`, {
    method: "POST",
    headers: { authorization: `Basic ${btoa(env.TOSS_SECRET_KEY + ":")}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { ok: r.ok, status: r.status, data: (await r.json()) as Record<string, unknown> };
}
