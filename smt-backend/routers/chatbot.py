# routers/chatbot.py  –  Chat replies + MongoDB logging
import re
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel

from db.mongo_client import get_mongo

router = APIRouter()


class ChatIn(BaseModel):
    message: str
    session_id: Optional[str] = None


# ── Intent rules ──────────────────────────────────────────────
RULES = [
    (r"\b(hi|hello|hey|good\s*(morning|afternoon|evening))\b",
     "👋 Hello! Welcome to **Soft Master Technology**! I'm here to help. "
     "You can ask me about our services, pricing, team, or how to get started."),

    (r"\b(service|what do you do|offer|provide|speciali[sz]e)\b",
     "🚀 We offer:\n\n"
     "• **Web Development** – React, Vue, Node.js, Django\n"
     "• **Mobile Apps** – Flutter, React Native (iOS & Android)\n"
     "• **Cloud Solutions** – AWS, Azure, GCP, DevOps\n"
     "• **AI & Automation** – ML models, chatbots, RPA\n"
     "• **IT Consulting** – Architecture, audits, roadmaps\n"
     "• **Cybersecurity** – Pen testing, VAPT, compliance\n\n"
     "Which area interests you most?"),

    (r"\b(price|pricing|cost|quote|budget|how much|rate|charge)\b",
     "💰 Pricing depends on project scope, tech stack, and timeline. "
     "We offer **transparent, milestone-based pricing** with no hidden costs.\n\n"
     "👉 Fill out the **Contact** form on our website and we'll send a detailed quote within 24 hours. "
     "Or call us at **+91 98765 43210**."),

    (r"\b(how long|timeline|duration|deadline|how soon|deliver)\b",
     "⏱️ Typical timelines:\n\n"
     "• Simple website – 2–4 weeks\n"
     "• Mobile app – 6–12 weeks\n"
     "• Enterprise system – 3–6 months\n\n"
     "We follow **Agile sprints** with weekly demos so you're always in the loop."),

    (r"\b(contact|reach|phone|email|address|location|where are you|office)\b",
     "📍 **Soft Master Technology**\n"
     "Vijayawada, Andhra Pradesh, India\n\n"
     "✉️ hello@softmastertechnology.com\n"
     "📞 +91 98765 43210\n"
     "🕐 Mon–Sat, 9 AM – 7 PM IST\n\n"
     "Or use the **Contact** section on this page!"),

    (r"\b(about|who are you|company|smt|team|founded|how old)\b",
     "🏢 **Soft Master Technology** is a full-service IT company based in Vijayawada, AP.\n\n"
     "We build scalable digital products for startups and enterprises across India and globally. "
     "Our team of 50+ engineers, designers, and cloud architects has delivered 100+ projects."),

    (r"\b(career|job|hiring|vacancy|opening|work with|join|internship)\b",
     "🎯 We're always looking for talented people!\n\n"
     "Check our **Careers** page for open positions in:\n"
     "• Full Stack Development\n• Mobile (Flutter)\n• DevOps / Cloud\n• AI / ML\n• UI/UX Design\n\n"
     "👉 Visit **/careers** to apply directly."),

    (r"\b(tech|stack|technology|framework|language|react|flutter|python|java|node)\b",
     "⚙️ Our core tech stack:\n\n"
     "**Frontend:** React, Vue, Next.js\n"
     "**Backend:** Node.js, Python (FastAPI/Django), Java Spring\n"
     "**Mobile:** Flutter, React Native\n"
     "**Cloud:** AWS, Azure, GCP, Docker, Kubernetes\n"
     "**Database:** PostgreSQL, MongoDB, Redis, Supabase"),

    (r"\b(support|help|issue|problem|bug|trouble)\b",
     "🎧 For technical support, please email **support@softmastertechnology.com** "
     "or call **+91 98765 43210**.\n\n"
     "Our support team is available Mon–Sat, 9 AM – 7 PM IST."),

    (r"\b(thank|thanks|thank you|thx|ty)\b",
     "😊 You're welcome! Is there anything else I can help you with?"),

    (r"\b(bye|goodbye|see you|later|cya)\b",
     "👋 Goodbye! Have a great day. Feel free to chat again anytime!"),
]

_compiled = [(re.compile(p, re.IGNORECASE), r) for p, r in RULES]

DEFAULT_REPLY = (
    "🤔 Thanks for your message! For detailed queries, please reach out to us directly:\n\n"
    "✉️ hello@softmastertechnology.com\n"
    "📞 +91 98765 43210\n\n"
    "Or use the **Contact** form on this page — we respond within 24 hours!"
)


def _get_reply(message: str) -> str:
    for pattern, reply in _compiled:
        if pattern.search(message):
            return reply
    return DEFAULT_REPLY


# POST /api/chat
@router.post("/chat")
async def chat(body: ChatIn):
    reply = _get_reply(body.message)
    # Log to MongoDB (best-effort)
    try:
        db = get_mongo()
        db["chat_logs"].insert_one({
            "session_id": body.session_id,
            "message":    body.message[:2000],
            "reply":      reply,
            "logged_at":  datetime.now(timezone.utc),
        })
    except Exception:
        pass  # never fail the chat response because of logging
    return {"reply": reply}
