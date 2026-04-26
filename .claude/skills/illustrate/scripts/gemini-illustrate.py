#!/usr/bin/env python3
"""Generate SVG illustrations via Gemini 2.5 Pro / 3.1 Pro side-by-side.

Mirror of `gemini-translate.py`, but for SVG markup. Reads a JSON spec
file describing what to draw, sends it to both Pro models with a system
prompt that enforces project conventions (currentColor strokes, viewBox,
no inline styles, plain SVG primitives), and writes each model's raw SVG
output to /tmp/gemini-svg/.

Usage:
    python3 .claude/skills/illustrate/scripts/gemini-illustrate.py <spec.json>

Where <spec.json> is a JSON file with keys:
    {
      "id":         "ch1_6_hero",          // identifier for output filenames
      "viewBox":    "0 0 540 220",          // SVG viewBox
      "subject":    "...prose description of what to draw...",
      "reference":  "...optional reference description (what the user sketched)...",
      "constraints": [
        "stroke=\"currentColor\" everywhere — no fill colours",
        "use plain SVG primitives only (path/circle/line/ellipse/text/g)",
        "...etc..."
      ]
    }

Outputs:
    /tmp/gemini-svg/<id>_2.5_Pro.svg
    /tmp/gemini-svg/<id>_3.1_Pro.svg

Then user inspects both and picks one (or asks for another iteration).

Requires GEMINI_API_KEY in .env.local (repo root).
"""
import json
import re
import sys
import urllib.request
import urllib.error
from pathlib import Path

# ── Load API key silently from .env.local ─────────────────────────────
def load_api_key() -> str:
    env_file = Path('.env.local')
    if not env_file.exists():
        sys.exit('.env.local not found. Create it with GEMINI_API_KEY=... '
                 '(repo root, git-ignored).')
    for line in env_file.read_text().splitlines():
        if line.startswith('GEMINI_API_KEY='):
            return line.split('=', 1)[1].strip().strip('"\'')
    sys.exit('GEMINI_API_KEY not found in .env.local')


# ── CLI ───────────────────────────────────────────────────────────────
if len(sys.argv) != 2:
    sys.exit(f'Usage: {sys.argv[0]} <spec.json>')

spec_path = Path(sys.argv[1])
if not spec_path.exists():
    sys.exit(f'Spec file not found: {spec_path}')

spec = json.loads(spec_path.read_text())
required = {'id', 'viewBox', 'subject'}
missing = required - set(spec.keys())
if missing:
    sys.exit(f'Spec missing required keys: {sorted(missing)}')

if not re.match(r'^[A-Za-z0-9_]+$', spec['id']):
    sys.exit(f'Invalid id {spec["id"]!r}. Use alnum + underscore only.')

api_key = load_api_key()


# ── System prompt ─────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are a senior SVG illustrator. You produce hand-craftable, theme-aware SVG markup for the Radiopedia electronics textbook. Your output is a SINGLE SVG element — no commentary, no markdown fences, no JSON wrapping, no <html>, no <?xml?> declaration. Just the <svg>…</svg> markup, ready to paste directly into a React component.

═══════════════════════════════════════════════════════════════════
HARD CONSTRAINTS — every output MUST satisfy all of these
═══════════════════════════════════════════════════════════════════

1. ROOT element is exactly one <svg> with the requested viewBox, no fixed width/height attributes, fill="none", and aria-label set to a one-sentence description of what the SVG depicts.

2. THEMING: every visible stroke uses stroke="currentColor". Fills, when used, are either fill="none", fill="currentColor" (with opacity for a tint), or fill="hsl(var(--background))" (for an opaque occluder that adapts to dark mode). NEVER hard-coded colours like "#000", "black", "red", "rgb(...)", or named colours other than "currentColor" / "none".

3. PRIMITIVES: use only <g>, <path>, <line>, <circle>, <ellipse>, <rect>, <polyline>, <polygon>, <text>, <tspan>. NO <filter>, <clipPath> with mask, <pattern>, <foreignObject>, <image>, <use>, <defs> with gradients, JavaScript, or external references.

4. STYLE: NO inline style="…" attributes. NO CSS. Use SVG presentation attributes only (stroke, stroke-width, fill, opacity, font-family, font-size, text-anchor, etc.).

5. TEXT: font-family="Georgia, serif" for prose / labels. font-size as em-relative ("0.95em") or absolute ("14"). Italic math-style labels (V, I, B, L, etc.) get font-style="italic" font-weight="700".

6. STROKE WIDTHS: 1.0–2.0 px for primary lines; 0.7–0.9 for secondary / faint lines.

7. NO ROUGH.JS-style hand-drawn jitter. Output clean geometric SVG. The chapter wraps the result if hand-drawn aesthetic is needed.

8. PEDAGOGICAL CORRECTNESS: every spatial relationship must reflect the physics. If a wire wraps AROUND a rod, the front-pass on the rod's face must be visible while the back-pass is occluded by the rod's solid fill. If a current arrow points right, label "I" goes to the LEFT of the arrow tip. If a field has a direction, an arrowhead shows it.

9. LABEL PLACEMENT: never overlap labels with strokes or filled shapes. Leave 4 px clearance. If a label sits inside a shape, that shape must have low-opacity fill (0.18 or less) and no stroke crossing the label baseline.

10. SIZE FIDELITY: respect the requested viewBox exactly. Place the main subject within the central 80 % of the viewBox; reserve the outer 10 % as breathing room.

═══════════════════════════════════════════════════════════════════
EXPECTED OUTPUT SHAPE
═══════════════════════════════════════════════════════════════════

<svg viewBox="0 0 W H" fill="none" aria-label="…" xmlns="http://www.w3.org/2000/svg">
  <!-- Layer 1: background tints / fills -->
  <!-- Layer 2: BEHIND-elements drawn before any occluder -->
  <!-- Layer 3: occluders (forms, backgrounds) -->
  <!-- Layer 4: FRONT-elements drawn on top -->
  <!-- Layer 5: text labels -->
</svg>

Begin output IMMEDIATELY with `<svg`. End with `</svg>`. Nothing else.
"""


# ── User prompt assembled from the spec ───────────────────────────────
constraints_block = ''
if spec.get('constraints'):
    constraints_block = '\n\nADDITIONAL CONSTRAINTS:\n' + '\n'.join(
        f'- {c}' for c in spec['constraints']
    )

reference_block = ''
if spec.get('reference'):
    reference_block = f"\n\nREFERENCE (what the user sketched / wants to match):\n{spec['reference']}"

USER_PROMPT = f"""Generate one SVG illustration.

viewBox: {spec['viewBox']}
id: {spec['id']}

SUBJECT — what to draw:
{spec['subject']}{reference_block}{constraints_block}

Output ONLY the <svg> element. No prose."""


def call_gemini(model: str) -> dict:
    body = {
        'systemInstruction': {'parts': [{'text': SYSTEM_PROMPT}]},
        'contents': [{'role': 'user', 'parts': [{'text': USER_PROMPT}]}],
        'generationConfig': {
            'temperature': 0.4,
            'topP': 0.85,
            'maxOutputTokens': 32768,
            'responseMimeType': 'text/plain',
        },
    }
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}'
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return {'error': e.read().decode('utf-8', errors='replace')}


def extract_svg(text: str) -> str:
    """Strip markdown fences and any leading/trailing prose to isolate the SVG."""
    # Remove ```svg / ```xml / ``` fences
    text = re.sub(r'^\s*```(?:svg|xml|html)?\s*\n', '', text)
    text = re.sub(r'\n\s*```\s*$', '', text)
    # Find first <svg ... and last </svg>
    m = re.search(r'<svg[\s\S]*</svg>', text)
    if m:
        return m.group(0)
    return text.strip()


MODELS = [
    ('gemini-2.5-pro',         '2.5 Pro'),
    ('gemini-3.1-pro-preview', '3.1 Pro'),
]

out_dir = Path('/tmp/gemini-svg')
out_dir.mkdir(exist_ok=True)

for model_id, label in MODELS:
    print(f'→ {label} ({model_id}) …', flush=True)
    resp = call_gemini(model_id)
    if 'error' in resp:
        print(f'  ✗ {resp["error"][:300]}')
        continue
    try:
        text = resp['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        print(f'  ✗ parse: {e}')
        print('  raw:', json.dumps(resp, ensure_ascii=False)[:500])
        continue
    svg = extract_svg(text)
    if not svg.startswith('<svg'):
        print(f'  ⚠ output does not start with <svg — saving raw for inspection')
    fn = out_dir / f'{spec["id"]}_{label.replace(" ", "_")}.svg'
    fn.write_text(svg)
    print(f'  ✓ {fn} ({len(svg)} chars)')

print()
print('Done. Open both SVGs in a browser side-by-side, pick one, and')
print('drop into the React component (preserving viewBox + aria-label).')
