git add DEVELOPER_TASKS.md .gitignore
git commit -m "docs: update DEVELOPER_TASKS.md with phases and priority matrix"

git add src/core/taxonomy.py
git commit -m "feat(ai): refactor taxonomy for component specificity and domain anchors"

git add src/ai/extractor.py src/core/pipeline.py
git commit -m "feat(core): update pipeline to handle clarification flow and generic queries"

git add contracts/schema.py contracts/deeplinks.json
git commit -m "feat(contracts): update schemas and deeplinks for advanced intents"

git add src/ai/matcher.py
git commit -m "feat(ai): implement domain-constrained matcher to prevent cross-domain leakage"

git add tests/test_domain_rigidity.py
git commit -m "test: add domain rigidity benchmark tests"

git add src/frontend-next/package.json src/frontend-next/package-lock.json src/frontend-next/next.config.ts src/frontend-next/tsconfig.json src/frontend-next/postcss.config.mjs src/frontend-next/tailwind.config.ts src/frontend-next/src/app/globals.css src/frontend-next/src/app/layout.tsx src/frontend-next/src/app/page.tsx src/frontend-next/src/app/context/PhoneContext.tsx
git commit -m "feat(frontend): scaffold Next.js 14 project with global contexts and layout"

git add src/frontend-next/src/app/components/StatusBar.tsx src/frontend-next/src/app/components/NavigationBar.tsx src/frontend-next/src/app/components/LockScreen.tsx src/frontend-next/src/app/components/HomeScreen.tsx src/frontend-next/src/app/components/AppDrawer.tsx
git commit -m "feat(frontend): build Phone UI simulator components (LockScreen, Home, AppDrawer)"

git add src/frontend-next/src/app/components/SettingsApp.tsx src/frontend-next/src/app/components/FixbyFAB.tsx src/frontend-next/src/app/components/FixbyOverlay.tsx src/frontend-next/src/lib/api.ts
git commit -m "feat(frontend): build Fixby NLP overlay and SettingsApp auto-navigation"

git add src/frontend-next/public/locales/ src/frontend-next/src/app/context/TranslationContext.tsx
git add .
git commit -m "feat(frontend): implement multilingual support (EN, HI, HI-EN, KO) and translation context"

git push origin HEAD
