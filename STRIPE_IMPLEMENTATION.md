# Stripe Integration Implementation

This document outlines the Stripe integration for subscription management in the EatWise application.

## Features Implemented

1. **Subscription Plans**
   - Monthly and yearly recurring subscription options
   - 7-day free trial for both plans
   - Promotion code support

2. **Backend Implementation**
   - Stripe checkout session creation endpoint
   - Webhook handling for subscription events
   - Billing portal access for users to manage their subscriptions
   - Database model updates for storing Stripe customer IDs and subscription data

3. **Frontend Implementation**
   - Pricing page to display subscription options
   - Account page with subscription management
   - Protected routes based on subscription status

## Database Schema Changes

The following changes were made to the database schema:

1. **User Model**
   - Added `stripe_customer_id` field (String, nullable)
   - Added `subscription_id` field (String, nullable)
   - Added `subscription_end` field (DateTime, nullable)

2. **Subscription Model**
   - Added `status` field (String, default "trialing")

## API Endpoints

### Subscription Management

1. `POST /api/subscription/create-checkout-session`
   - Creates a Stripe checkout session for subscription
   - Parameters: `plan` (required), `promo_code` (optional)
   - Returns checkout URL and session ID

2. `POST /api/subscription/webhook`
   - Handles Stripe webhook events
   - Processes checkout.session.completed, invoice.payment_succeeded, customer.subscription.updated, customer.subscription.deleted

3. `GET /api/subscription/billing-portal`
   - Returns URL to Stripe billing portal for subscription management

4. `POST /api/subscription/cancel`
   - Cancels user subscription both in Stripe and database

5. `GET /api/subscription/plans`
   - Returns available subscription plans with pricing and features

### Security Features

1. Role-based access control on frontend and backend
2. Server-side validation of subscription status
3. Automatic user role updates based on subscription events

## Configuration

Ensure the following environment variables are set:

```
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Testing

To test the integration:

1. Use Stripe test mode cards (e.g., 4242 4242 4242 4242)
2. Test subscription lifecycle: subscribe, trial, payment, cancellation
3. Test promo codes with the Stripe dashboard

## Migration Steps

1. Run the migration to add Stripe fields to database:
   ```
   alembic upgrade head
   ```

2. Configure Stripe webhook endpoints in the Stripe dashboard to point to:
   ```
   https://your-domain.com/api/subscription/webhook
   ```

3. Set up products and prices in the Stripe dashboard matching the following IDs:
   - premium_monthly
   - premium_yearly