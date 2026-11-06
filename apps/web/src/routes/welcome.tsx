import { createFileRoute } from "@tanstack/react-router";

import { WelcomePage } from "@/features/onboarding/components/WelcomePage";

export const Route = createFileRoute("/welcome")({
  staticData: { title: "Boas-vindas" },
  component: WelcomePage,
});
