"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
            Master AI Communication
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300">
            Learn prompt engineering through structured, progressive courses with AI-powered feedback
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link href="/api/auth/signin/google">
            <Button size="lg" className="w-full sm:w-auto">
              Sign in with Google
            </Button>
          </Link>
          <Link href="/api/auth/signin/github">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Sign in with GitHub
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 pt-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Structured Learning</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Progress through carefully designed courses from beginner to advanced
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Feedback</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get instant, detailed feedback on your prompts using advanced AI
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">Practical Applications</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Apply your skills to real-world scenarios and projects
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
