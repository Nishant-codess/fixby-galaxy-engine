import re

with open("src/frontend/index.html", "r") as f:
    content = f.read()

# Extract from <canvas id="webgl-canvas" to </main>
match = re.search(r'<canvas id="webgl-canvas".*?</main>', content, re.DOTALL)
if not match:
    print("Match not found")
    exit(1)
    
html = match.group(0)

# Replace class= with className=
html = html.replace('class="', 'className="')

# Simple regex to convert style="key: value;" to style={{ key: 'value' }}
# We'll just do a basic replace for the known styles or strip them if they are too complex
# Actually, the user has many inline styles. Let's write a smarter regex for inline styles.

def style_replacer(m):
    style_str = m.group(1)
    rules = style_str.split(';')
    jsx_style = []
    for rule in rules:
        if ':' not in rule: continue
        k, v = rule.split(':', 1)
        k = k.strip()
        v = v.strip().replace('"', "'")
        # camelCase the key
        k_parts = k.split('-')
        k = k_parts[0] + ''.join(x.title() for x in k_parts[1:])
        jsx_style.append(f"{k}: '{v}'")
    return "style={{" + ", ".join(jsx_style) + "}}"

html = re.sub(r'style="([^"]*)"', style_replacer, html)

# Fix <br> and <hr> self closing
html = html.replace('<br>', '<br />').replace('<hr>', '<hr />')

# Write to component
component = """export default function LandingPage({ onEnterConsole }: { onEnterConsole: () => void }) {
  return (
    <>
""" + html + """
    </>
  );
}
"""

with open("src/frontend-next/src/app/components/LandingPage.tsx", "w") as f:
    f.write(component)
print("Done")
