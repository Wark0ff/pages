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
      <p className="font-hand text-3xl">Вход для автора</p>
      <p className="mt-2 text-ink/70">Открытки делает только автор стихов. Смотреть их можно всем по ссылке.</p>
      <input
        type="password"
        className="field mt-6"
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
