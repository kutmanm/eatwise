Your task is to:

1. Search the existing FastAPI backend codebase and:
   - Identify any existing Stripe-related code
   - Enhance or refactor it to support the following features:
     - Monthly and yearly recurring subscription plans
     - Stripe-hosted Checkout with optional promocodes
     - 7-day free trial setup per plan
     - Promotion code redemption support
     - Webhook handling for trial, payment success, and cancellations
     - User model update on webhook events (role, subscription_end, etc.)

2. If required, create or update:
   - A create_checkout_session() endpoint that:
     - Accepts plan and optional promo_code from the frontend
     - Redirects to Stripe Checkout with discounts and trial_period_days if applicable
   - A webhook endpoint /webhook that handles:
     - checkout.session.completed
     - invoice.payment_succeeded
     - customer.subscription.updated
     - customer.subscription.deleted
   - A billing portal endpoint to let users manage their subscription

3. In the database:
   - Update the User model with:
     - stripe_customer_id, subscription_id, subscription_end, role
   - Ensure Subscription is one-to-one with User and stores:
     - plan, start_date, end_date, status

4. On the Next.js frontend:
   - Create minimal pages/components:
     - /pricing page to show pricing options and call the backend for checkout session
     - Redirect to Stripe Checkout session URL
     - /account page to allow access to billing portal

5. Security & UX:
   - Ensure protected frontend routes based on user role (FREE, PREMIUM, TRIAL)
   - Do not rely on localStorage for user state; use server validation if possible
   - Ensure free users can’t access premium endpoints or pages
   - Automatically downgrade users on subscription cancel or payment failure

6. Use prebuilt Stripe forms:
   - Stripe-hosted checkout (stripe.checkout.sessions.create)
   - Stripe Billing Portal (stripe.billing_portal.sessions.create)

7. Add any missing helper utilities, validation, logging.

8. Write migration instructions if model schema changed.