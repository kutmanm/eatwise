from fastapi import APIRouter, Depends, Request, Response, Body
from sqlalchemy.orm import Session
from models.database import get_db
from services.subscription_service import create_checkout_session, handle_webhook_event, get_billing_portal_url, get_subscription_plans, cancel_user_subscription
from models.user import User
from services.auth_service import get_current_user
from utils.config import settings
from typing import Optional
import stripe

router = APIRouter(prefix="/subscription", tags=["subscription"])

class CheckoutRequest:
    def __init__(self, plan: str, promo_code: Optional[str] = None,
                 success_url: str = "http://localhost:3000/dashboard",
                 cancel_url: str = "http://localhost:3000/pricing"):
        self.plan = plan
        self.promo_code = promo_code
        self.success_url = success_url
        self.cancel_url = cancel_url

@router.post("/create-checkout-session")
async def checkout(
    data: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new Stripe checkout session for subscription"""
    plan = data.get("plan")
    promo_code = data.get("promo_code")
    success_url = data.get("success_url", "http://localhost:3000/dashboard")
    cancel_url = data.get("cancel_url", "http://localhost:3000/pricing")
    
    if not plan:
        return {"error": "Plan is required"}
    
    return await create_checkout_session(
        user=current_user,
        plan=plan,
        success_url=success_url,
        cancel_url=cancel_url,
        promo_code_str=promo_code
    )

@router.post("/webhook", status_code=200)
async def stripe_webhook(request: Request, response: Response, db: Session = Depends(get_db)):
    """Handle Stripe webhook events"""
    signature = request.headers.get("stripe-signature")
    payload = await request.body()
    
    result = await handle_webhook_event(payload, signature, db)
    return {"success": result}

@router.get("/billing-portal")
async def get_billing_portal(
    current_user: User = Depends(get_current_user)
):
    """Get URL for Stripe billing portal where users can manage their subscription"""
    portal_url = await get_billing_portal(current_user)
    return {"url": portal_url}

@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel user subscription both in Stripe and database"""
    success = await cancel_user_subscription(current_user, db)
    return {"success": success}

@router.get("/plans")
async def subscription_plans():
    """Get available subscription plans with pricing and features"""
    plans = get_subscription_plans()
    return plans