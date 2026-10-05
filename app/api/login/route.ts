import { checkPassword, signIn } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (!checkPassword(String(password ?? ""))) {
    return Response.json({ error: "Неверный пароль" }, { status: 401 });
  }
  await signIn();
  return Response.json({ ok: true });
}
