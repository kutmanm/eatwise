import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – Eatwise",
  description:
    "Learn how Eatwise collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 prose prose-slate dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p>Last updated: 10 August 2025</p>

      <p>
        This Privacy Policy explains how Eatwise ("we", "us", "our") collects,
        uses, discloses, and protects your information when you use our
        website, mobile application, APIs, or services (collectively, the
        "Service").
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>
          Account information: name, email, password hash, and preferences.
        </li>
        <li>
          Profile and usage data: nutrition goals, meal logs, activity, device
          and technical data.
        </li>
        <li>
          Payment information: handled by our payment processor (e.g., Paddle).
          We do not store full payment card details on our servers.
        </li>
        <li>
          Communications: feedback, support requests, and survey responses.
        </li>
      </ul>

      <h2>2. How We Use Information</h2>
      <ul>
        <li>Provide, maintain, and improve the Service.</li>
        <li>Personalize features and recommendations (including AI features).</li>
        <li>Process payments and manage subscriptions.</li>
        <li>Communicate with you about updates, security, and support.</li>
        <li>Comply with legal obligations and enforce our Terms.</li>
      </ul>

      <h2>3. Legal Bases (EEA/UK)</h2>
      <p>
        Where applicable, we process personal data on the following legal bases:
        performance of a contract, legitimate interests, consent (where
        required), and compliance with legal obligations.
      </p>

      <h2>4. Sharing and Disclosure</h2>
      <ul>
        <li>
          Service providers: including hosting, analytics, and payments (e.g.,
          Paddle) to operate the Service.
        </li>
        <li>
          Compliance and safety: to comply with law or protect rights and safety.
        </li>
        <li>
          Business transfers: in connection with a merger, acquisition, or asset
          sale.
        </li>
      </ul>

      <h2>5. Cookies and Tracking</h2>
      <p>
        We use cookies and similar technologies to provide essential
        functionality, remember preferences, and measure performance. You can
        control cookies through browser settings; disabling cookies may impact
        some features.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        We retain information for as long as necessary to provide the Service,
        comply with legal obligations, resolve disputes, and enforce agreements.
      </p>

      <h2>7. Security</h2>
      <p>
        We implement technical and organizational measures designed to protect
        your information. No method of transmission or storage is completely
        secure; we cannot guarantee absolute security.
      </p>

      <h2>8. Children’s Privacy</h2>
      <p>
        The Service is not directed to children under 13. If you believe a child
        has provided us personal information, contact us and we will take steps
        to delete it.
      </p>

      <h2>9. International Transfers</h2>
      <p>
        Your information may be transferred to and processed in countries other
        than your own. Where required, we implement safeguards for such
        transfers.
      </p>

      <h2>10. Your Rights</h2>
      <p>
        Depending on your location, you may have rights such as access,
        correction, deletion, portability, objection, and restriction. To
        exercise rights, contact
        <a href="mailto:support@eatwise.app"> support@eatwise.app</a>.
      </p>

      <h2>11. Third-Party Links and AI</h2>
      <p>
        The Service may link to third-party sites and use AI features. Third
        parties have their own privacy policies. Review them to understand how
        your data is handled.
      </p>

      <h2>12. Changes to This Policy</h2>
      <p>
        We may update this Policy from time to time. Material changes will be
        posted on this page or communicated through the Service.
      </p>

      <h2>13. Contact Us</h2>
      <p>
        If you have questions about this Policy, contact us at
        <a href="mailto:support@eatwise.app"> support@eatwise.app</a>.
      </p>
    </main>
  );
}


