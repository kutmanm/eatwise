import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service – Eatwise",
  description:
    "Read the Eatwise Terms of Service. Understand your rights and responsibilities when using our app.",
};

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 prose prose-slate dark:prose-invert">
      <h1>Terms of Service</h1>
      <p>
        Last updated: 10 August 2025
      </p>

      <p>
        Welcome to Eatwise. By accessing or using our website, mobile
        application, APIs, or services (collectively, the "Service"), you agree
        to be bound by these Terms of Service ("Terms"). If you do not agree to
        these Terms, do not use the Service.
      </p>

      <h2>1. Eligibility</h2>
      <p>
        You must be at least 13 years old (or the age of digital consent in your
        jurisdiction) to use the Service. If you are under 18, you represent that
        you have your parent or legal guardian’s permission to use the Service.
      </p>

      <h2>2. Accounts and Security</h2>
      <ul>
        <li>You are responsible for maintaining the confidentiality of your account.</li>
        <li>You are responsible for all activities under your account.</li>
        <li>
          Notify us immediately of any unauthorized use or security incident at
          <a href="mailto:support@eatwise.app"> support@eatwise.app</a>.
        </li>
      </ul>

      <h2>3. Subscriptions, Billing, and Taxes</h2>
      <p>
        Paid subscriptions may be billed and processed by our payment partner
        Paddle. Prices, features, and billing cycles are shown at checkout.
        Applicable taxes may be charged based on your location. By starting a
        subscription, you authorize us and/or Paddle to charge your selected
        payment method on a recurring basis until you cancel.
      </p>
      <p>
        Our refund terms are described in our <a href="/refund-policy">Refund Policy</a>.
      </p>

      <h2>4. Acceptable Use</h2>
      <ul>
        <li>Do not attempt to disrupt or overload the Service.</li>
        <li>Do not misuse, reverse engineer, or circumvent security controls.</li>
        <li>Do not upload unlawful, harmful, or infringing content.</li>
      </ul>

      <h2>5. Nutrition and Health Disclaimer</h2>
      <p>
        Eatwise provides nutrition and wellness information for educational
        purposes only. We do not provide medical advice, diagnosis, or treatment.
        Always consult a qualified healthcare professional for questions related
        to your health, diet, or medical conditions.
      </p>

      <h2>6. AI-Assisted Features</h2>
      <p>
        Some features use generative AI. Outputs may be inaccurate or
        incomplete. You are responsible for reviewing suggestions and making your
        own decisions. Do not rely on AI outputs for medical or safety-critical
        decisions.
      </p>

      <h2>7. User Content</h2>
      <p>
        You retain ownership of content you submit. You grant Eatwise a
        worldwide, non-exclusive, royalty-free license to host, store, process,
        and display your content solely to operate and improve the Service. You
        represent that you have the rights to submit the content and that it
        does not infringe third-party rights.
      </p>

      <h2>8. Third-Party Services</h2>
      <p>
        The Service may integrate with third parties (e.g., Paddle for payments).
        Your use of third-party services is subject to their terms and privacy
        policies.
      </p>

      <h2>9. Termination</h2>
      <p>
        We may suspend or terminate access to the Service at any time for any
        reason, including breaches of these Terms. You may stop using the Service
        at any time. Sections intended to survive termination shall do so.
      </p>

      <h2>10. Disclaimers</h2>
      <p>
        The Service is provided on an "as is" and "as available" basis without
        warranties of any kind, express or implied, including merchantability,
        fitness for a particular purpose, and non-infringement.
      </p>

      <h2>11. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Eatwise and its affiliates shall
        not be liable for any indirect, incidental, special, consequential, or
        punitive damages, or any loss of profits or revenues, whether incurred
        directly or indirectly, or any loss of data, use, goodwill, or other
        intangible losses.
      </p>

      <h2>12. Changes to the Service or Terms</h2>
      <p>
        We may modify the Service or these Terms from time to time. Material
        changes will be posted on this page or communicated through the Service.
        Your continued use constitutes acceptance of the updated Terms.
      </p>

      <h2>13. Governing Law</h2>
      <p>
        These Terms are governed by applicable laws of your country or state of
        residence, without regard to conflict of law principles, unless a
        mandatory local law provides otherwise.
      </p>

      <h2>14. Contact</h2>
      <p>
        Questions about these Terms? Contact us at
        <a href="mailto:support@eatwise.app"> support@eatwise.app</a>.
      </p>
    </main>
  );
}


