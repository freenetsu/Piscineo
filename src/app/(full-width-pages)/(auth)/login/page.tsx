'use client';

import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Connexion à votre compte
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Utilisez votre compte Google pour vous connecter
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}
