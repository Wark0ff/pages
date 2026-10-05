"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await fetch("/api/login", { method: "POST", body: JSON.stringify({ password }) });
    setBusy(false);
    if (r.ok) router.refresh();
    else setError("Пароль не подошёл");
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm py-20">
      <h1 className="font-display text-4xl font-semibold">Вход для автора</h1>
      <p className="mt-2 text-muted">Открытки делает только автор стихов. Смотреть их можно всем по ссылке.</p>
      <label htmlFor="pw" className="label mt-6">Пароль</label>
      <input
        id="pw"
        type="password"
        autoComplete="current-password"
        className="field"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
      />
      {error && <p className="mt-2 text-sm text-red-800">{error}</p>}
      <button className="btn mt-4 w-full" disabled={busy || !password}>
        {busy ? "Проверяю…" : "Войти"}
      </button>
    </form>
  );
}
