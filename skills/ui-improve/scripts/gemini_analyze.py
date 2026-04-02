#!/usr/bin/env python3
"""Analyze a UI screenshot via Gemini Vision and return structured scores."""

import argparse
import json
import os
import sys
import time
from pathlib import Path

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("Error: google-genai not installed. Run via scripts/run.sh.")
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None


def find_api_key() -> str | None:
    """Find GEMINI_API_KEY from environment then .env files.

    Priority:
    1. GEMINI_API_KEY environment variable
    2. skills/ui-improve/.env
    3. skills/.env
    4. .claude/.env
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        return api_key

    if load_dotenv is None:
        return None

    skill_dir = Path(__file__).parent.parent
    for env_path in [
        skill_dir / ".env",
        skill_dir.parent / ".env",
        skill_dir.parent.parent / ".env",
    ]:
        if env_path.exists():
            load_dotenv(env_path)
            api_key = os.getenv("GEMINI_API_KEY")
            if api_key:
                return api_key

    return None


ANALYSIS_PROMPT = """Analyze this user interface screenshot. Rate each criterion from 1 to 10.

Respond ONLY with valid JSON using this exact structure:
{
  "scores": {
    "visual_hierarchy": <int 1-10>,
    "color_harmony": <int 1-10>,
    "typography": <int 1-10>,
    "spacing_layout": <int 1-10>,
    "modern_feel": <int 1-10>,
    "consistency": <int 1-10>
  },
  "overall_score": <float, average of scores>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "improvements": [
    {
      "priority": 1,
      "area": "<affected area>",
      "current": "<current state>",
      "suggested": "<suggested improvement>",
      "css_hint": "<CSS/Tailwind hint if applicable>"
    }
  ]
}"""


def analyze_image(
    image_path: str,
    model: str = "gemini-2.5-flash",
    custom_prompt: str | None = None,
    max_retries: int = 3,
) -> dict:
    """Send a screenshot to Gemini Vision and return the JSON analysis."""
    api_key = find_api_key()
    if not api_key:
        print("Error: GEMINI_API_KEY not found.", file=sys.stderr)
        print("Set via: export GEMINI_API_KEY='your-key'", file=sys.stderr)
        print("Or create a .env with: GEMINI_API_KEY=your-key", file=sys.stderr)
        sys.exit(1)

    path = Path(image_path)
    if not path.exists():
        print(f"Error: file not found: {image_path}", file=sys.stderr)
        sys.exit(1)

    prompt = custom_prompt or ANALYSIS_PROMPT

    with open(path, "rb") as f:
        image_bytes = f.read()

    mime_types = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
    }
    mime_type = mime_types.get(path.suffix.lower(), "image/png")

    client = genai.Client(api_key=api_key)

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=model,
                contents=[
                    prompt,
                    types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                ),
            )

            result = json.loads(response.text)
            return result

        except Exception as e:
            if attempt == max_retries - 1:
                return {"error": str(e), "overall_score": 0}
            wait = 2**attempt
            print(f"Retry {attempt + 1}/{max_retries} in {wait}s: {e}", file=sys.stderr)
            time.sleep(wait)


def main():
    parser = argparse.ArgumentParser(description="UI analysis via Gemini Vision")
    parser.add_argument("image", help="Path to the screenshot to analyze")
    parser.add_argument(
        "--model",
        default="gemini-2.5-flash",
        help="Gemini model (default: gemini-2.5-flash)",
    )
    parser.add_argument("--prompt", help="Custom prompt (replaces default prompt)")
    parser.add_argument("--output", "-o", help="Output JSON file (default: stdout)")

    args = parser.parse_args()
    result = analyze_image(args.image, model=args.model, custom_prompt=args.prompt)

    output = json.dumps(result, indent=2, ensure_ascii=False)

    if args.output:
        Path(args.output).parent.mkdir(parents=True, exist_ok=True)
        Path(args.output).write_text(output)
        print(f"Result saved: {args.output}")
    else:
        print(output)


if __name__ == "__main__":
    main()
