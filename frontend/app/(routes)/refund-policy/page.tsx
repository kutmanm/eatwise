import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy – Eatwise",
  description:
    "Understand Eatwise refund terms for subscriptions and purchases.",
};

export default function RefundPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 prose prose-slate dark:prose-invert">
      <h1>Refund Policy</h1>
      <p>Last updated: 10 August 2025</p>

      <p>
        We want you to be satisfied with Eatwise. This Refund Policy explains
        when refunds may be issued for subscriptions and purchases made through
        our Service.
      </p>

      <h2>1. Free Trials</h2>
      <p>
        If a free trial is offered, you will not be charged until the trial ends.
        Cancel before the trial ends to avoid charges.
      </p>

      <h2>2. Subscriptions</h2>
      <ul>
        <li>
          Subscriptions renew automatically until canceled. You can cancel at any
          time; access remains until the end of the current billing period.
        </li>
        <li>
          Partial period refunds are generally not provided unless required by
          law.
        </li>
      </ul>

      <h2>3. How to Request a Refund</h2>
      <p>
        Payments may be processed by Paddle. To request a refund, contact our
        support team at
        <a href="mailto:support@eatwise.app"> support@eatwise.app</a> with your
        order details (email used for purchase, receipt, and reason). Where
        applicable, Paddle’s purchaser support may assist with refunds according
        to their policies.
      </p>

      <h2>4. Unauthorized or Fraudulent Charges</h2>
      <p>
        If you believe there has been an unauthorized charge, contact us
        immediately at
        <a href="mailto:support@eatwise.app"> support@eatwise.app</a>.
      </p>

      <h2>5. Statutory Rights</h2>
      <p>
        Nothing in this policy affects any rights you may have under applicable
        consumer protection laws in your jurisdiction.
      </p>

      <h2>6. Changes to This Policy</h2>
      <p>
        We may update this Refund Policy from time to time. Material changes
        will be posted on this page or communicated through the Service.
      </p>
    </main>
  );
}


