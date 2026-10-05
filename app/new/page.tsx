import Creator from "@/components/Creator";
import LoginForm from "@/components/LoginForm";
import { isPoet } from "@/lib/auth";

export const metadata = { title: "Новая открытка" };

export default async function NewCard() {
  return (await isPoet()) ? <Creator /> : <LoginForm />;
}
