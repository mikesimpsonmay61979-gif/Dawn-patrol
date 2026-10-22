import { adsTxtResponse } from "@/lib/ads-txt";

export const dynamic = "force-dynamic";

export function GET() {
  return adsTxtResponse();
}
