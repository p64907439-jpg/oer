import { redirect } from "next/navigation";

// /login is no longer used — the admin login gate lives at /admin
export default function LoginPage() {
  redirect("/admin");
}
