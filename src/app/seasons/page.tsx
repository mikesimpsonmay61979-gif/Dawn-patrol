import type { Metadata } from "next";
import { SeasonsView } from "@/components/SeasonsView";

export const metadata: Metadata = { title: "Seasons" };

export default function SeasonsPage() {
  return <SeasonsView />;
}
