import type { Metadata } from "next";
import { TodayView } from "@/components/TodayView";

export const metadata: Metadata = {
  title: { absolute: "Dawn Patrol" },
};

export default function HomePage() {
  return <TodayView />;
}
