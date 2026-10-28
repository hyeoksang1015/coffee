"use client";

import { useEffect, useState } from "react";
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// NEXT_PUBLIC_ 값은 빌드 때 코드에 박힌다. 브라우저에 공개되는 값이라 괜찮고, 실제 보호는 Firestore 규칙(firestore.rules)이 한다.
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const configured = Object.values(config).every(Boolean);

// 정적 빌드(서버 렌더) 중에는 만들지 않고, 브라우저에서 처음 쓸 때 만든다.
let app: FirebaseApp | undefined;
const getApp = () => (app ??= getApps()[0] ?? initializeApp(config));
export const auth = () => getAuth(getApp());
export const db = () => getFirestore(getApp());

const ADMIN_UIDS = (process.env.NEXT_PUBLIC_ADMIN_UIDS ?? "").split(",").filter(Boolean);
/** 관리자 화면을 보여 줄지만 정한다. 실제로 막는 건 Firestore 규칙과 서버 함수다. */
export const isAdmin = (u: User | null | undefined) => !!u && ADMIN_UIDS.includes(u.uid);

/** undefined: 아직 확인 중, null: 로그아웃 상태 */
export function useUser() {
  const [user, setUser] = useState<User | null | undefined>(configured ? undefined : null);
  useEffect(() => (configured ? onAuthStateChanged(auth(), setUser) : undefined), []);
  return user;
}

const messages: Record<string, string> = {
  "auth/email-already-in-use": "이미 가입된 이메일입니다. 로그인해 주세요.",
  "auth/invalid-email": "이메일 형식이 올바르지 않습니다.",
  "auth/weak-password": "비밀번호는 6자 이상이어야 합니다.",
  "auth/invalid-credential": "이메일 또는 비밀번호가 맞지 않습니다.",
  "auth/user-disabled": "사용이 중지된 계정입니다.",
  "auth/too-many-requests": "시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.",
  "auth/network-request-failed": "네트워크 연결을 확인해 주세요.",
  "auth/operation-not-allowed": "Firebase 콘솔에서 이메일/비밀번호 로그인이 꺼져 있습니다.",
  "permission-denied": "데이터베이스 권한이 없습니다. Firestore 규칙을 확인해 주세요.",
};

export const errorMessage = (e: unknown) => {
  const code = (e as { code?: string })?.code ?? "";
  return messages[code] ?? `문제가 생겼습니다. 다시 시도해 주세요.${code ? ` (${code})` : ""}`;
};
