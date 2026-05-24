import LandingPage from "@/components/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CampusBridge - Alumni Management Platform & Placement Network",
  description: "Optimize campus placements, cultivate an active student-alumni network, track job applications, and secure professional referrals with CampusBridge.",
  alternates: {
    canonical: "https://campusbridge.zinoingroup.in",
  }
};

export default function Home() {
  return (
    <main>
      <LandingPage />
    </main>
  );
}
