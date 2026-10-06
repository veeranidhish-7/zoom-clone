import os
import random
import re
import string


FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def generate_meeting_code() -> str:
    """Generate an 11-digit numeric meeting code."""
    return "".join(random.choices(string.digits, k=11))


def format_meeting_id(code: str) -> str:
    """Format 11-digit code as '123 4567 8901'."""
    return f"{code[:3]} {code[3:7]} {code[7:]}"


def build_join_url(code: str) -> str:
    return f"{FRONTEND_URL}/j/{code}"


# Regex to extract digits-only 11-char codes from various input formats:
# - plain "12345678901"
# - spaced "123 4567 8901"
# - dashed "123-4567-8901"
# - full link "https://host/j/123 4567 8901?pwd=x"
_LINK_RE = re.compile(r"/j/([\d\s\-]+)", re.IGNORECASE)


def normalize_code(raw: str) -> str | None:
    """
    Strip spaces/dashes, extract digits from a full link.
    Returns the 11-digit code or None if invalid.
    """
    raw = raw.strip()
    # Try to extract from a /j/ link first
    m = _LINK_RE.search(raw)
    if m:
        raw = m.group(1)
    # Strip separators
    digits = re.sub(r"[\s\-]", "", raw)
    if re.fullmatch(r"\d{11}", digits):
        return digits
    return None
