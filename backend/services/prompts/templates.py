from typing import Optional, List


BASE_PROMPT = (
    "You are a nutrition expert creating personalized 7-day meal plans. "
    "Create practical, balanced meal plans that consider user goals, symptoms, and preferences. "
    "Return structured JSON only."
)


DOMAIN_ADDENDA = {
    "digestion": (
        " Emphasize gentle-on-gut options, moderate fat load, fiber tolerance, and steady meal timing."
    ),
    "skin": (
        " Consider glycemic load, dairy moderation, and anti-inflammatory fats; avoid highly processed oils."
    ),
    "fatigue": (
        " Support steady energy with balanced macros, iron/B12 sources as appropriate, and hydration."
    ),
}


def get_plan_system_prompt(symptoms_focus: Optional[List[str]]) -> str:
    domain = None
    if symptoms_focus and len(symptoms_focus) > 0:
        domain = (symptoms_focus[0] or '').lower()
    return BASE_PROMPT + DOMAIN_ADDENDA.get(domain, "")


