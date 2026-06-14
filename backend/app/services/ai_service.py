"""
AI Intelligence Layer — multi-model waterfall with automatic failover.
On any 429 / quota / rate-limit error, advances to the next model silently.
On 404 / unavailable errors, also advances (dead endpoint, not retryable).
Raises RuntimeError only when every model in the chain is exhausted.
"""
import json
import logging
import re
from typing import List, Dict, Any, Optional, Tuple
from openai import OpenAI
from app.config import settings

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# MODEL WATERFALL CHAIN
# Add/remove models here freely. Order = priority.
# OpenRouter free models: https://openrouter.ai/models?q=free
# Gemini free models: AI Studio free tier (resets every 24h)
# ─────────────────────────────────────────────────────────────────────────────
_MODEL_CHAIN: List[Tuple[str, str]] = [
    # ── OpenRouter free tier (verified live as of 2026-06-14) ────────────────
    ("openrouter", "meta-llama/llama-3.3-70b-instruct:free"),
    ("openrouter", "nousresearch/hermes-3-llama-3.1-405b:free"),
    ("openrouter", "nvidia/nemotron-3-super-120b-a12b:free"),
    ("openrouter", "openai/gpt-oss-120b:free"),
    ("openrouter", "openai/gpt-oss-20b:free"),
    ("openrouter", "qwen/qwen3-next-80b-a3b-instruct:free"),
    ("openrouter", "qwen/qwen3-coder:free"),
    ("openrouter", "nvidia/nemotron-3-ultra-550b-a55b:free"),
    ("openrouter", "google/gemma-4-31b-it:free"),
    ("openrouter", "google/gemma-4-26b-a4b-it:free"),
    ("openrouter", "nvidia/nemotron-3-nano-30b-a3b:free"),
    ("openrouter", "meta-llama/llama-3.2-3b-instruct:free"),
    ("openrouter", "cognitivecomputations/dolphin-mistral-24b-venice-edition:free"),
    ("openrouter", "liquid/lfm-2.5-1.2b-instruct:free"),
    # ── Gemini AI Studio free tier ────────────────────────────────────────────
    ("gemini",     "gemini-2.0-flash"),
    ("gemini",     "gemini-2.0-flash-lite"),
    ("gemini",     "gemini-1.5-flash-latest"),
]

# ── Clients ───────────────────────────────────────────────────────────────────
_openrouter_client: Optional[OpenAI] = None
if settings.OPENROUTER_API_KEY:
    _openrouter_client = OpenAI(
        api_key=settings.OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1",
        max_retries=0,
        default_headers={
            "HTTP-Referer": "https://pulse-crm.app",
            "X-Title": "PULSE CRM",
        }
    )

_gemini_client: Optional[OpenAI] = None
if settings.GEMINI_API_KEY:
    _gemini_client = OpenAI(
        api_key=settings.GEMINI_API_KEY,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        max_retries=0,
    )

# Legacy alias — existing code in this file that calls `client` still works
client = _openrouter_client


def _get_client(provider: str) -> Optional[OpenAI]:
    if provider == "openrouter":
        return _openrouter_client
    if provider == "gemini":
        return _gemini_client
    return None


def _should_advance(error: Exception) -> Tuple[bool, str]:
    """
    Decide whether to advance the chain, and why.
    Returns (should_advance: bool, reason: str)

    Always advance on:
      - 429 rate limit / quota exceeded
      - 404 model not found / no endpoints
      - 503 / 502 upstream unavailable
      - Any connection error

    The chain is a safety net — advancing on unknown errors
    is safer than crashing the whole request.
    """
    msg = str(error).lower()

    if any(k in msg for k in ["429", "rate limit", "quota", "resource_exhausted",
                               "too many requests", "retry"]):
        return True, "rate_limited"

    if any(k in msg for k in ["404", "no endpoints", "not found",
                               "model not found", "unavailable"]):
        return True, "model_unavailable"

    if any(k in msg for k in ["502", "503", "504", "upstream", "timeout",
                               "connection", "network"]):
        return True, "upstream_error"

    # Unknown error — advance anyway (fail-safe)
    return True, "unknown_error"


BRAND_VOICE = """
You are the AI brain of PULSE CRM, a marketing tool for KORA — a contemporary Indian fashion brand 
(ethnic wear, western wear, footwear, accessories). KORA's customers are urban Indian shoppers aged 18-55.
Brand voice: warm, aspirational, personal. Never generic. Occasional Hinglish is fine.
"""

AVAILABLE_FIELDS = """
Customer filter fields you can use:
- days_since_last_order (integer, days)
- total_spend (decimal, rupees)
- avg_order_value (decimal, rupees)
- total_orders (integer)
- tier (string: "bronze", "silver", "gold", "platinum")
- preferred_cat (string: "Ethnic Wear", "Western Wear", "Footwear", "Accessories", "Activewear", "Kidswear")
- city (string: "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad")
- gender (string: "male", "female")
- age (integer)
- opted_out (boolean, always add: {"field": "opted_out", "op": "eq", "value": false})

Operators: gte, lte, gt, lt, eq, neq, in
"""


def _call_ai(prompt: str, system: str = BRAND_VOICE) -> str:
    """
    Walk the model chain until one succeeds.
    Logs every skip with the reason so we can see exactly what happened.
    """
    last_error: Optional[Exception] = None
    tried: List[str] = []

    for provider, model in _MODEL_CHAIN:
        ai_client = _get_client(provider)

        if ai_client is None:
            logger.debug(f"Skipping {provider}/{model} — no API key configured")
            continue

        label = f"{provider}/{model}"
        tried.append(label)

        try:
            logger.info(f"AI -> trying {label}")
            response = ai_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user",   "content": prompt},
                ],
                temperature=0.7,
                max_tokens=2000,
            )
            result = response.choices[0].message.content.strip()
            logger.info(f"AI success with {label}")
            return result

        except Exception as e:
            last_error = e
            should_advance, reason = _should_advance(e)
            logger.warning(
                f"AI SKIP {label} [{reason}] — "
                f"{str(e)[:100]} — advancing chain"
            )
            if should_advance:
                continue
            # If for some reason we decide not to advance, stop here
            break

    raise RuntimeError(
        f"All models exhausted after trying {len(tried)}: {tried}. "
        f"Last error: {last_error}"
    )


def _extract_json(text: str) -> Any:
    """Robustly extract JSON from a model response that may have prose around it."""
    # Try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try stripping markdown code fences
    cleaned = re.sub(r"```(?:json)?\s*", "", text).replace("```", "").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Try extracting first {...} or [...] block
    match = re.search(r"(\{.*\}|\[.*\])", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not extract JSON from AI response: {text[:300]}")


# ─────────────────────────────────────────────────────────────────────────────
# 1. SEGMENT INTELLIGENCE
# ─────────────────────────────────────────────────────────────────────────────

def parse_segment_brief(brief: str) -> Dict[str, Any]:
    """
    Convert a natural-language audience description into a structured rule tree.

    Returns:
        {
          "rules": { "operator": "AND", "conditions": [...] },
          "rationale": "Plain-English explanation",
          "suggested_channel": "whatsapp",
          "suggested_timing": "Tuesday 10:00 AM",
          "segment_name": "Short descriptive name"
        }
    """
    prompt = f"""
Convert this marketing brief into a customer segment rule tree for KORA fashion brand.

Brief: "{brief}"

{AVAILABLE_FIELDS}

Return ONLY valid JSON with this exact structure (no prose, no markdown):
{{
  "segment_name": "Short descriptive name (max 50 chars)",
  "rules": {{
    "operator": "AND",
    "conditions": [
      {{"field": "...", "op": "...", "value": ...}},
      {{"field": "opted_out", "op": "eq", "value": false}}
    ]
  }},
  "rationale": "2-3 sentence explanation of why these filters match the brief and what makes this audience valuable",
  "suggested_channel": "whatsapp",
  "suggested_timing": "Best day and time to send (e.g. Tuesday 10:00 AM)"
}}

Always include opted_out = false. Use conservative thresholds.
"""
    raw = _call_ai(prompt)
    data = _extract_json(raw)

    # Validate required keys
    required = ["rules", "rationale", "segment_name"]
    for key in required:
        if key not in data:
            raise ValueError(f"AI response missing key: {key}")

    # Ensure opted_out filter is always present
    conditions = data["rules"].get("conditions", [])
    has_opted_out = any(c.get("field") == "opted_out" for c in conditions)
    if not has_opted_out:
        conditions.append({"field": "opted_out", "op": "eq", "value": False})
    data["rules"]["conditions"] = conditions

    return data


# ─────────────────────────────────────────────────────────────────────────────
# 2. PER-CUSTOMER MESSAGE PERSONALIZATION
# ─────────────────────────────────────────────────────────────────────────────

def generate_messages_batch(
    customers: List[Dict[str, Any]],
    campaign_goal: str,
    channel: str,
) -> List[Dict[str, str]]:
    """
    Generate per-customer personalized messages in batches of 20.

    customers: list of dicts with keys: id, name, preferred_cat,
               days_since_last_order, tier, city, avg_order_value
    Returns: list of {customer_id, message}
    """
    all_results = []
    batch_size = 20
    char_limit = 160 if channel == "sms" else 300

    for i in range(0, len(customers), batch_size):
        batch = customers[i:i + batch_size]

        # Trim customer data to only what AI needs
        trimmed = [
            {
                "id": str(c["id"]),
                "first_name": c["name"].split()[0],
                "last_category": c.get("preferred_cat", "fashion"),
                "days_away": c.get("days_since_last_order", 30),
                "tier": c.get("tier", "silver"),
                "city": c.get("city", ""),
            }
            for c in batch
        ]

        prompt = f"""
Generate personalized {channel.upper()} messages for KORA fashion brand customers.

Campaign goal: {campaign_goal}
Character limit: {char_limit} characters maximum per message
Channel: {channel}

Customer data:
{json.dumps(trimmed, indent=2)}

Rules:
- Use the customer's first name naturally
- Reference their last purchase category or city when it feels natural
- Warm, personal tone — never sound like a bulk blast
- Include a clear call-to-action
- Stay under {char_limit} characters
- For WhatsApp/RCS you can use 1-2 emojis max
- NEVER be generic ("Dear valued customer" is forbidden)

Return ONLY a JSON array (no prose, no markdown):
[
  {{"customer_id": "uuid", "message": "personalized message here"}},
  ...
]
"""
        try:
            raw = _call_ai(prompt)
            batch_results = _extract_json(raw)
            if isinstance(batch_results, list):
                all_results.extend(batch_results)
            else:
                logger.warning(f"Unexpected AI response shape for batch {i}")
        except Exception as e:
            logger.error(f"Message generation failed for batch {i}: {e}")
            # Fallback: generate simple template messages
            for c in batch:
                all_results.append({
                    "customer_id": str(c["id"]),
                    "message": f"Hi {c['name'].split()[0]}! Check out KORA's latest collection → kora.in/shop"
                })

    return all_results


# ─────────────────────────────────────────────────────────────────────────────
# 3. ARIA CAMPAIGN ORCHESTRATOR
# ─────────────────────────────────────────────────────────────────────────────

def orchestrate_aria_brief(
    brief: str,
    customer_count: int,
    sample_customers: List[Dict[str, Any]],
    avg_order_value: float,
) -> Dict[str, Any]:
    """
    Process a full ARIA campaign brief.
    Returns a complete plan including segment, channel, timing, sample messages.
    """
    # Step 1: Parse segment
    segment_data = parse_segment_brief(brief)

    # Step 2: Generate sample messages (first 3 customers)
    sample_messages = []
    if sample_customers:
        try:
            msgs = generate_messages_batch(
                customers=sample_customers[:3],
                campaign_goal=brief,
                channel=segment_data.get("suggested_channel", "whatsapp"),
            )
            sample_messages = [
                {
                    "customer_name": next(
                        (c["name"].split()[0] for c in sample_customers if str(c["id"]) == m["customer_id"]),
                        "Customer"
                    ),
                    "message": m["message"]
                }
                for m in msgs
            ]
        except Exception as e:
            logger.warning(f"Sample message generation failed: {e}")

    # Step 3: Estimate revenue
    channel = segment_data.get("suggested_channel", "whatsapp")
    channel_open_rates = {
        "whatsapp": 0.52, "sms": 0.28, "email": 0.21, "rcs": 0.44
    }
    channel_click_rates = {
        "whatsapp": 0.18, "sms": 0.08, "email": 0.05, "rcs": 0.22
    }
    open_rate = channel_open_rates.get(channel, 0.30)
    click_rate = channel_click_rates.get(channel, 0.10)
    conversion_rate = 0.08  # 8% of clickers convert
    avg_ov = avg_order_value or 2500

    estimated_conversions_low = int(customer_count * open_rate * click_rate * conversion_rate * 0.7)
    estimated_conversions_high = int(customer_count * open_rate * click_rate * conversion_rate * 1.3)
    revenue_low = round(estimated_conversions_low * avg_ov, 2)
    revenue_high = round(estimated_conversions_high * avg_ov, 2)

    return {
        "segment_name": segment_data.get("segment_name", "ARIA Segment"),
        "segment_rules": segment_data["rules"],
        "segment_rationale": segment_data["rationale"],
        "customer_count": customer_count,
        "channel": channel,
        "channel_rationale": f"{channel.title()} has the best engagement rate ({int(open_rate*100)}% avg open) for this segment.",
        "timing_suggestion": segment_data.get("suggested_timing", "Tuesday 10:00 AM"),
        "sample_messages": sample_messages,
        "estimated_open_rate": open_rate,
        "estimated_revenue_low": revenue_low,
        "estimated_revenue_high": revenue_high,
    }


# ─────────────────────────────────────────────────────────────────────────────
# 4. CAMPAIGN INSIGHT GENERATOR
# ─────────────────────────────────────────────────────────────────────────────

def generate_campaign_insight(campaign_stats: Dict[str, Any]) -> str:
    """
    Generate a plain-English post-campaign insight paragraph.
    """
    prompt = f"""
Write a concise (3-4 sentence) marketing insight for this KORA campaign performance.
Be specific, reference the actual numbers, and end with one actionable recommendation.

Campaign stats:
{json.dumps(campaign_stats, indent=2)}

Return ONLY the insight text, no headers, no markdown.
"""
    try:
        return _call_ai(prompt)
    except Exception as e:
        logger.warning(f"Insight generation failed: {e}")
        name = campaign_stats.get("name", "Campaign")
        delivered = campaign_stats.get("total_delivered", 0)
        opened = campaign_stats.get("total_opened", 0)
        return (
            f"Your {name} reached {delivered} customers. "
            f"{opened} opened the message ({int(opened/max(delivered,1)*100)}% open rate). "
            "Consider a follow-up campaign targeting non-openers within 72 hours."
        )


# ─────────────────────────────────────────────────────────────────────────────
# 5. DASHBOARD INSIGHT
# ─────────────────────────────────────────────────────────────────────────────

def generate_dashboard_insight(stats: Dict[str, Any]) -> str:
    """Generate a brief daily insight for the dashboard insight card."""
    prompt = f"""
Write a single-sentence marketing insight for a KORA brand dashboard.
Be specific and actionable. Reference the data.

Stats: {json.dumps(stats)}

Return ONLY the insight sentence.
"""
    try:
        return _call_ai(prompt)
    except Exception:
        return f"Your top channel is {stats.get('top_channel', 'WhatsApp')} with {stats.get('avg_open_rate', 0):.0%} average open rate."
