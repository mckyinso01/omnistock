import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { price_id, success_url, cancel_url } = await req.json();
    if (!price_id) return Response.json({ error: 'price_id is required' }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: price_id, quantity: 1 }],
      customer_email: user.email,
      success_url: success_url || `${req.headers.get('origin')}/monetization?success=1`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/monetization`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_id: user.id,
        user_email: user.email,
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});