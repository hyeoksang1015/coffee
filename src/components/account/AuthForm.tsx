"use client";

import { useState, type FormEvent } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, configured, errorMessage } from "@/lib/firebase";
import { EMAIL } from "@/lib/forms";
import { btnPrimary, field } from "../ui";

/** 로그인·회원가입. 성공하면 useUser() 가 바뀌어 부모 화면이 다음 단계를 보여 준다. */
export default function AuthForm({ title = "로그인", note }: { title?: string; note?: string }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");
    if (mode === "signup" && (!name || name.length > 30)) return setError("이름을 30자 이내로 입력해 주세요.");
    if (!EMAIL.test(email)) return setError("이메일 형식이 올바르지 않습니다.");
    if (password.length < 6) return setError("비밀번호는 6자 이상이어야 합니다.");
    setBusy(true);
    setError("");
    try {
      if (mode === "login") await signInWithEmailAndPassword(auth(), email, password);
      else {
        const { user } = await createUserWithEmailAndPassword(auth(), email, password);
        await updateProfile(user, { displayName: name });
      }
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  if (!configured) return <p className="rounded-lg bg-error/10 p-space-md text-body-md text-error">Firebase 설정(.env.local)이 없어 로그인을 쓸 수 없습니다.</p>;

  const tab = (m: typeof mode, label: string) => (
    <button type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setError(""); }} className="min-h-11 flex-1 rounded-lg text-body-md font-semibold text-secondary aria-selected:bg-canvas-card aria-selected:text-navy-ink aria-selected:shadow-sm">
      {label}
    </button>
  );

  return (
    <div className="mx-auto w-full max-w-md rounded-xl bg-canvas-card p-space-lg shadow-sm">
      <h1 className="text-headline-md text-navy-ink">{title}</h1>
      {note && <p className="mt-1 text-body-sm text-secondary">{note}</p>}
      <div role="tablist" aria-label="로그인 방식" className="mt-space-md flex gap-1 rounded-lg bg-surface-container p-1">
        {tab("login", "로그인")}
        {tab("signup", "회원가입")}
      </div>
      <form noValidate onSubmit={submit} className="mt-space-md space-y-space-sm">
        {mode === "signup" && (
          <label className="block">
            <span className="mb-1 block text-label-caps uppercase text-navy-ink">이름</span>
            <input name="name" autoComplete="name" maxLength={30} className={`${field} h-11`} />
          </label>
        )}
        <label className="block">
          <span className="mb-1 block text-label-caps uppercase text-navy-ink">이메일</span>
          <input name="email" type="email" autoComplete="email" maxLength={100} className={`${field} h-11`} />
        </label>
        <label className="block">
          <span className="mb-1 block text-label-caps uppercase text-navy-ink">비밀번호 {mode === "signup" && <span className="normal-case text-secondary">(6자 이상)</span>}</span>
          <input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} maxLength={100} className={`${field} h-11`} />
        </label>
        <p role="alert" className="min-h-5 text-body-sm text-error">
          {error}
        </p>
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full disabled:opacity-60`}>
          {busy ? "확인 중…" : mode === "login" ? "로그인" : "가입하고 시작하기"}
        </button>
        {mode === "signup" && <p className="text-body-sm text-secondary">데모 사이트입니다. 실제로 쓰는 비밀번호는 넣지 마세요. 인증 메일은 보내지 않습니다.</p>}
      </form>
    </div>
  );
}
