from typing import Dict, Any, Optional
import stripe
from sqlalchemy.orm import Session
from models.user import User, UserRole, Subscription
from schemas.user import SubscriptionCreate
from services.user_service import create_subscription, cancel_subscription, get_user_subscription
from utils.config import settings
from fastapi import HTTPException, status
from datetime import datetime

stripe.api_key = settings.stripe_secret_key

STRIPE_PRICE_IDS = {
    "premium_monthly": "price_premium_monthly",
    "premium_yearly": "price_premium_yearly"
}
async def create_checkout_session(
    user: User, 
    plan: str, 
    success_url: str, 
    cancel_url: str,
    promo_code_str: Optional[str] = None
) -> Dict[str, str]:
    try:
        # For testing, use test mode Stripe keys and hardcoded price IDs
        # In production, these would be real price IDs from your Stripe dashboard
        test_price_ids = {
            "premium_monthly": "price_1RslUwCaGbzSvk3rvO6CH4pE",  # Monthly subscription price ID
            "premium_yearly": "price_1RslYiCaGbzSvk3rUNxmalsi"   # Yearly subscription price ID
        }
        
        price_id = test_price_ids.get(plan) or STRIPE_PRICE_IDS.get(plan)
        if not price_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid subscription plan"
            )

        discounts = None
        if promo_code_str:
            # For testing, we'll accept any promo code
            # In production, verify against actual Stripe promo codes
            try:
                promo_codes = stripe.PromotionCode.list(
                    code=promo_code_str,
                    active=True,
                    limit=1
                )
                if promo_codes.data:
                    discounts = [{"promotion_code": promo_codes.data[0].id}]
                    print(f"Found promo code: {promo_code_str}, applying discount")
                else:
                    # For testing, create a coupon on the fly
                    coupon = stripe.Coupon.create(
                        percent_off=15,
                        duration="once",
                        name=f"Promo {promo_code_str}"
                    )
                    discounts = [{"coupon": coupon.id}]
                    print(f"Created coupon for promo code: {promo_code_str}")
            except Exception as e:
                print(f"Error processing promo code: {str(e)}")
                # Don't fail the checkout if promo code processing fails
                pass
        
        session = stripe.checkout.Session.create(
            customer_email=user.email,
            payment_method_types=["card"],
            line_items=[{
                "price": price_id,
                "quantity": 1,
            }],
            mode="subscription",
            subscription_data={
                "trial_period_days": 7
            },
            discounts=discounts,
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": str(user.id),
                "plan": plan
            }
        )
        
        return {
            "checkout_url": session.url,
            "session_id": session.id
        }

    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )

async def handle_webhook_event(event_data: Dict[str, Any], signature: str, db: Session) -> bool:
    try:
        event = stripe.Webhook.construct_event(
            event_data, signature, settings.stripe_webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        await handle_successful_payment(session, db)
    
    elif event["type"] == "invoice.payment_succeeded":
        invoice = event["data"]["object"]
        await handle_payment_succeeded(invoice, db)
    
    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        await handle_subscription_cancelled(subscription, db)
    elif event["type"] == "customer.subscription.updated":
        subscription = event["data"]["object"]
        await handle_subscription_updated(subscription, db)

    return True
async def handle_subscription_updated(subscription_data: Dict[str, Any], db: Session):
    customer_id = subscription_data["customer"]
    status = subscription_data["status"]  # active, trialing, canceled
    current_period_end = subscription_data["current_period_end"]

    try:
        customer = stripe.Customer.retrieve(customer_id)
        user = db.query(User).filter(User.email == customer.email).first()

        if not user:
            return

        if status in ["active", "trialing"]:
            user.role = UserRole.PREMIUM
        else:
            user.role = UserRole.FREE
        
        user.subscription_expires_at = datetime.utcfromtimestamp(current_period_end)
        db.commit()
    
    except stripe.error.StripeError:
        pass

async def handle_successful_payment(session_data: Dict[str, Any], db: Session):
    user_id = session_data["metadata"]["user_id"]
    plan = session_data["metadata"]["plan"]
    
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        subscription_data = SubscriptionCreate(plan=plan)
        await create_subscription(user, subscription_data, db)

async def handle_payment_succeeded(invoice_data: Dict[str, Any], db: Session):
    customer_id = invoice_data["customer"]
    
    try:
        customer = stripe.Customer.retrieve(customer_id)
        user = db.query(User).filter(User.email == customer.email).first()
        
        if user and user.role != UserRole.PREMIUM:
            user.role = UserRole.PREMIUM
            db.commit()
    
    except stripe.error.StripeError:
        pass

async def handle_subscription_cancelled(subscription_data: Dict[str, Any], db: Session):
    customer_id = subscription_data["customer"]
    
    try:
        customer = stripe.Customer.retrieve(customer_id)
        user = db.query(User).filter(User.email == customer.email).first()
        
        if user:
            await cancel_subscription(user, db)
    
    except stripe.error.StripeError:
        pass

async def get_billing_portal_url(user: User) -> str:
    try:
        customers = stripe.Customer.list(email=user.email, limit=1)
        
        if not customers.data:
            customer = stripe.Customer.create(email=user.email)
        else:
            customer = customers.data[0]
        
        session = stripe.billing_portal.Session.create(
            customer=customer.id,
            return_url="http://localhost:3000/dashboard"
        )
        
        return session.url
    
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )

async def cancel_user_subscription(user: User, db: Session) -> bool:
    try:
        customers = stripe.Customer.list(email=user.email, limit=1)
        
        if customers.data:
            customer = customers.data[0]
            subscriptions = stripe.Subscription.list(customer=customer.id, status="active")
            
            for subscription in subscriptions.data:
                stripe.Subscription.delete(subscription.id)
        
        return await cancel_subscription(user, db)
    
    except stripe.error.StripeError:
        return await cancel_subscription(user, db)

def get_subscription_plans() -> Dict[str, Any]:
    return {
        "premium_monthly": {
            "name": "Premium Monthly",
            "price": 9.99,
            "currency": "usd",
            "interval": "month",
            "features": [
                "Unlimited meal logging",
                "Advanced AI coaching chat",
                "Full history access",
                "Detailed nutrition analysis",
                "AI recipe suggestions",
                "Export data functionality"
            ]
        },
        "premium_yearly": {
            "name": "Premium Yearly",
            "price": 167.88,
            "currency": "usd",
            "interval": "year",
            "features": [
                "Unlimited meal logging",
                "Advanced AI coaching chat", 
                "Full history access",
                "Detailed nutrition analysis",
                "AI recipe suggestions",
                "Export data functionality",
                "2 months free!"
            ]
        }
    }