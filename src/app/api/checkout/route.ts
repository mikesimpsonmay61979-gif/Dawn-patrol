import { PLANS, type PlanId } from "@/lib/billing";

/**
 * Stripe hook. No charge happens until STRIPE_SECRET_KEY and a price id are set
 * and the stripe package is installed. See the README.
 */
export async function POST(request: Request) {
  let plan: PlanId | null = null;
  try {
    const body = (await request.json()) as { plan?: string };
    if (body.plan === "monthly" || body.plan === "yearly") plan = body.plan;
  } catch {
    plan = null;
  }

  if (!plan) {
    return Response.json({ message: "Pick a monthly or yearly plan." }, { status: 400 });
  }

  const priceEnv = plan === "monthly" ? "STRIPE_PRICE_MONTHLY" : "STRIPE_PRICE_YEARLY";
  const origin = new URL(request.url).origin;

  if (!process.env.STRIPE_SECRET_KEY || !process.env[priceEnv]) {
    return Response.json(
      {
        configured: false,
        plan,
        message:
          "Checkout isn't connected yet. Use the demo switch to try Pro on this phone. Nothing is charged.",
      },
      { status: 501 },
    );
  }

  // When payments are ready:
  // import Stripe from "stripe";
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  // const session = await stripe.checkout.sessions.create({
  //   mode: "subscription",
  //   line_items: [{ price: process.env[priceEnv], quantity: 1 }],
  //   success_url: `${origin}/pro?checkout=success`,
  //   cancel_url: `${origin}/pro?checkout=cancel`,
  // });
  // return Response.json({ url: session.url });
  void origin;

  return Response.json(
    {
      configured: true,
      plan,
      amountCents: PLANS[plan].amountCents,
      message:
        "Stripe keys are present, but the stripe package is not installed yet. Add it in this route and return the Checkout Session URL.",
    },
    { status: 501 },
  );
}
