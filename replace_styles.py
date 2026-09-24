import re

with open('src/frontend/index.html', 'r') as f:
    content = f.read()

replacements = [
    (r'style="color: var\(--trace\);"', 'class="preloader-label"'),
    (r'style="margin-top: var\(--s-6\);"', 'class="mt-6"'),
    (r'style="margin-top: var\(--s-8\);"', 'class="mt-8"'),
    (r'class="glass-pane" style="max-width: 600px; padding: var\(--s-8\);"', 'class="glass-pane glass-panel-lg"'),
    (r'class="glass-pane" style="max-width: 600px; padding: var\(--s-8\); margin-left: auto;"', 'class="glass-pane glass-panel-lg right"'),
    (r'class="glass-solid flex-col gap-2" style="margin-top: var\(--s-6\); padding: var\(--s-4\);"', 'class="glass-solid flex-col gap-2 fake-url-box"'),
    (r'style="margin-top: var\(--s-4\);"', 'class="mt-4"'),
    (r'style="text-align: center;"', 'class="text-center"'),
    (r'class="glass-pane" style="padding: var\(--s-8\); text-align: center;"', 'class="glass-pane glass-panel-lg center"'),
    (r'style="margin: var\(--s-4\) auto 0; max-width: 600px;"', ''),
    (r'style="color: var\(--filament\);"', 'class="text-filament"'),
    (r'style="padding: var\(--s-3\); display: flex; align-items: center; border-color: rgba\(140, 180, 255, 0\.20\);"', 'class="p-3 flex-row align-center border-b-edge"'),
    (r'style="padding: 0; margin-right: var\(--s-3\); min-width: auto;"', 'class="p-0 mr-3 min-w-auto"'),
    (r'style="width: 100%; background: transparent; border: none; color: var\(--text-hi\); outline: none;"', 'class="w-full bg-transparent border-none outline-none"'),
    (r'style="margin-right: var\(--s-2\);"', 'class="mr-2"'),
    (r'style="margin-right: var\(--s-3\);"', 'class="mr-3"'),
    (r'style="background: rgba\(22,29,40,0\.45\); cursor: pointer;"', 'class="cursor-pointer"'),
    (r'style="color: var\(--caution\); margin-right: 4px;"', 'class="mr-1 text-caution"'),
    (r'style="color: var\(--critical\); margin-right: 4px;"', 'class="mr-1 text-critical"'),
    (r'style="color: var\(--safe\); margin-right: 4px;"', 'class="mr-1 text-safe"'),
    (r'style="padding: var\(--s-5\);"', 'class="p-5"'),
    (r'style="margin-bottom: var\(--s-2\);"', 'class="mb-2"'),
    (r'style="margin-bottom: var\(--s-3\);"', 'class="mb-3"'),
    (r'style="margin-bottom: var\(--s-4\);"', 'class="mb-4"'),
    (r'style="width: 10px; height: 10px; border-radius: 50%; background: var\(--caution\); box-shadow: 0 0 0 3px rgba\(255,171,63,0\.2\);"', 'class="status-dot caution"'),
    (r'style="color: var\(--trace\); background: rgba\(76,141,255,0\.14\); border-color: rgba\(76,141,255,0\.4\);"', 'class="chip alert-trace"'),
    (r'style="padding: var\(--s-2\) var\(--s-3\); margin-bottom: var\(--s-4\);"', 'class="py-2 px-3 mb-4"'),
    (r'style="color: var\(--trace\); overflow-x: auto; white-space: nowrap;"', 'class="text-trace overflow-x-auto whitespace-nowrap"'),
    (r'style="width: 48px; height: 48px; background: white; border-radius: var\(--r-tight\); padding: 4px; flex-shrink: 0;"', 'class="app-icon"'),
    (r'style="margin-left: auto; flex-shrink: 0;"', 'class="ml-auto flex-shrink-0"'),
    (r'style="width: 100%; height: 600px; position: relative;"', 'class="w-full h-full relative"'),
    (r'style="min-height: 80vh;"', 'class="min-h-80vh"'),
    (r'style="position: fixed; right: -360px; top: 0; bottom: 0; width: 340px; z-index: 100; transition: right 0\.4s var\(--ease-descend\); display: flex; flex-direction: column;"', 'class="hud-drawer-panel"'),
    (r'style="padding: var\(--s-4\); border-bottom: var\(--glass-edge\);"', 'class="p-4 border-b-edge"'),
    (r'style="padding: 4px;"', 'class="p-1"'),
    (r'style="padding: var\(--s-4\); flex: 1; overflow-y: auto;"', 'class="p-4 flex-1 overflow-y-auto"'),
    (r'style="padding: var\(--s-3\) 0; border-bottom: var\(--glass-edge\);"', 'class="py-3 border-b-edge"'),
    (r'style="display: flex; height: 6px; border-radius: 3px; overflow: hidden; background: rgba\(255,255,255,0\.1\);"', 'class="hud-progress-bar"'),
    (r'style="flex: 0\.4; background: var\(--safe\);"', 'class="hud-progress-safe"'),
    (r'style="flex: 0\.3; background: var\(--trace\);"', 'class="hud-progress-trace"'),
    (r'style="flex: 0\.26; background: var\(--filament\);"', 'class="hud-progress-filament"'),
    (r'style="color: var\(--text-mid\);"', 'class="hud-json-pre"'),
    (r'style="padding: var\(--s-3\); overflow-x: auto;"', 'class="p-3 overflow-x-auto"'),
    (r'style="position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0\.3s;"', 'class="qr-modal-wrapper"'),
    (r'style="padding: var\(--s-8\); position: relative;"', 'class="qr-modal-content"'),
    (r'style="position: absolute; top: 16px; right: 16px;"', 'class="qr-modal-close-btn"'),
    (r'style="text-decoration: none;"', 'class="no-underline"'),
    (r'class="text-micro" class="preloader-label"', 'class="text-micro preloader-label"'),
    (r'class="body-lg" class="mt-6"', 'class="body-lg mt-6"'),
    (r'class="flex-row gap-4" class="mt-8"', 'class="flex-row gap-4 mt-8"')
]

for pat, repl in replacements:
    content = re.sub(pat, repl, content)

with open('src/frontend/index.html', 'w') as f:
    f.write(content)

print("Replaced styles.")
