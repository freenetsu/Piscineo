'use client';

import { AuthButton } from "@/components/auth/AuthButton";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from 'next/navigation';

export default function TestAuthPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold">Chargement...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-xl rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            {session ? 'Profil Utilisateur' : 'Page de Test Auth'}
          </h3>
        </div>
        <div className="p-6.5">
          {session ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "Profile"}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                )}
                <div>
                  <h4 className="text-xl font-semibold text-black dark:text-white">
                    {session.user?.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {session.user?.email}
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <AuthButton />
                <button
                  onClick={handleLogout}
                  className="w-full inline-flex items-center justify-center gap-2.5 rounded-md bg-danger px-10 py-4 text-center font-medium text-white hover:bg-opacity-90"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Se déconnecter et rediriger
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">
                Bienvenue
              </h2>
              <p className="mb-8 text-gray-500 dark:text-gray-400">
                Connectez-vous pour accéder à votre compte
              </p>
              <AuthButton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
