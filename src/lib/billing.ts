export type PlanId = "monthly" | "yearly";

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  cadence: string;
  amountCents: number;
  blurb: string;
};

export const PLANS: Record<PlanId, Plan> = {
  monthly: {
    id: "monthly",
    name: "Monthly",
    price: "$4.99",
    cadence: "per month",
    amountCents: 499,
    blurb: "For a month of dawns. Cancel when the season's over.",
  },
  yearly: {
    id: "yearly",
    name: "The year",
    price: "$29.99",
    cadence: "per year",
    amountCents: 2999,
    blurb: "About half the monthly rate, paid once.",
  },
};

export const PRO_FEATURES = [
  {
    title: "No sponsor strip",
    detail: "The field-note slot on Today goes away.",
  },
  {
    title: "Seven-day solunar",
    detail: "Dawn bite and move ratings, plus the major period, for the week ahead.",
  },
  {
    title: "Unlimited log",
    detail: "The free book holds 12 entries on this phone. Pro lifts the cap. Export stays free.",
  },
  {
    title: "Extra reads",
    detail: "Second Watch, the other quarry the same day, and Drift, a practice puzzle that doesn't touch your streak.",
  },
];

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export async function startCheckout(plan: PlanId): Promise<CheckoutResult> {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  const data = (await response.json().catch(() => ({}))) as { url?: string; message?: string };
  if (response.ok && typeof data.url === "string") return { ok: true, url: data.url };
  return {
    ok: false,
    message:
      typeof data.message === "string"
        ? data.message
        : "Checkout isn't connected yet. Nothing was charged.",
  };
}
