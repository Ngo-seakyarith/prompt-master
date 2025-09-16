import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Debug logging for authentication issues
  if (error) {
    console.log('🔍 Auth query error:', error);
  }

  if (user) {
    console.log('✅ User authenticated:', user.email || user.id);
  } else if (!isLoading) {
    console.log('❌ No authenticated user found');
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}