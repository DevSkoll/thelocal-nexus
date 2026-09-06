import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const currentUser = await getCurrentUser();
  if (currentUser) redirect("/discover");

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="font-serif text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Enter your phone number to sign in or create an account.
        </p>
        <p className="mt-1 text-xs text-ink-muted">
          Your local community hub — privacy first
        </p>
      </div>
      <LoginForm />
    </div>
  );
}