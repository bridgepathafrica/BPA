import { Router } from "express";
import { db, cvReviewsTable } from "@workspace/db";
import { eq } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth";

const router = Router();

router.post("/payments/create-checkout", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const { reviewId, successUrl, cancelUrl } = req.body as {
      reviewId: number;
      successUrl: string;
      cancelUrl: string;
    };

    if (!reviewId || !successUrl || !cancelUrl) {
      res.status(400).json({ error: "Bad Request", message: "reviewId, successUrl, cancelUrl required" });
      return;
    }

    const [review] = await db.select().from(cvReviewsTable)
      .where(eq(cvReviewsTable.id, reviewId))
      .limit(1);

    if (!review || review.userId !== userId) {
      res.status(404).json({ error: "Not Found" });
      return;
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      res.status(503).json({ error: "Service Unavailable", message: "Payment processing not configured. Please connect Stripe or provide STRIPE_SECRET_KEY." });
      return;
    }

    const stripe = (await import("stripe")).default;
    const stripeClient = new stripe(stripeKey);

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Human HR Expert Review",
              description: "Professional CV review by a certified HR specialist. Includes detailed feedback, career guidance, and job recommendations.",
            },
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        reviewId: String(reviewId),
        userId: String(userId),
      },
    });

    await db.update(cvReviewsTable)
      .set({
        stripeSessionId: session.id,
        paymentStatus: "pending",
        updatedAt: new Date(),
      })
      .where(eq(cvReviewsTable.id, reviewId));

    res.json({
      sessionId: session.id,
      url: session.url ?? "",
    });
  } catch (err) {
    req.log.error({ err }, "Error creating checkout session");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/payments/verify", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.body as { sessionId: string };

    if (!sessionId) {
      res.status(400).json({ error: "Bad Request", message: "sessionId required" });
      return;
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      res.status(503).json({ error: "Service Unavailable", message: "Payment processing not configured" });
      return;
    }

    const stripe = (await import("stripe")).default;
    const stripeClient = new stripe(stripeKey);

    const session = await stripeClient.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";

    if (paid && session.metadata?.reviewId) {
      const reviewId = parseInt(session.metadata.reviewId, 10);
      await db.update(cvReviewsTable)
        .set({ paymentStatus: "paid", updatedAt: new Date() })
        .where(eq(cvReviewsTable.id, reviewId));

      res.json({ paid: true, reviewId });
    } else {
      res.json({ paid: false, reviewId: null });
    }
  } catch (err) {
    req.log.error({ err }, "Error verifying payment");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
