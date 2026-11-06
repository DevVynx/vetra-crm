import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { useProfile } from "@/shared/queries/profile/useProfile";

// The app is only shown once the introduction was done. Until the profile arrives nothing is shown
// either, like the time zone provider, so the Painel never flashes before the introduction.
export function OnboardingGate({ children }: { children: ReactNode }) {
  const { data: profile } = useProfile();

  if (!profile) return null;
  if (!profile.isOnboarded) return <Navigate to="/welcome" replace />;

  return children;
}
