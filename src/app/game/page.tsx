import type { Metadata } from "next";
import { GameView } from "@/components/GameView";

export const metadata: Metadata = { title: "The Read" };

export default function GamePage() {
  return <GameView />;
}
