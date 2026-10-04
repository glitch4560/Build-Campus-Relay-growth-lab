# Campus Relay — NxtWave growth lab

The site has been rebuilt around the seven supplied reference screenshots: oversized typography, coral accents, the campaign brief, strategy cards, growth loop, forecast dashboard, yellow campaign summary, and blue student workshop preview.

## Open the site

Open `index.html` directly in Chrome or Edge. Keep the `assets` folder beside it. No installation or API key is needed to use the site.

For a local HTTP preview, run this from the workspace:

```powershell
npm start
```

Then visit http://localhost:8080. The website source lives at the repository root, development utilities are in `tools`, tests are in `tests`, and challenge documents are in `submission`.

If PowerShell blocks `npm.ps1`, run `npm.cmd start` (and use `npm.cmd` for the other npm commands below).

## Deploy to Vercel

Live website: https://campus-relay-growth-lab.vercel.app

The project includes `vercel.json`. Vercel builds with `npm run build` and serves only `dist/`, containing the HTML, CSS, JavaScript, and assets. No environment variables or runtime dependencies are needed.

From the project folder, run:

```powershell
npx.cmd vercel@latest login
npx.cmd vercel@latest link --yes --project campus-relay-growth-lab
npx.cmd vercel@latest --prod
```

Choose your Vercel account and accept creating/linking the project when prompted. The CLI prints the live URL when deployment finishes. Run the second command again to publish updates.

For a Git import in the Vercel dashboard, use framework preset **Other**, root directory **.**, build command **npm run build**, and output directory **dist**. These settings are already recorded in `vercel.json`.

The deployed site remains a demo: registrations stay in each visitor's browser storage and are not shared between devices.

## What works

- Brief/Preview switching, section navigation, and layouts from 320-pixel phones through large desktop screens.
- Workshop sample registration with eligibility and consent checks, normalized email deduplication, first-touch source attribution, and personal referral links.
- Budget and channel sliders. The forecast changes with the channel mix; Save model persists the scenario and updates the active campaign budget.
- The club captain toolkit prepares tracked links and invitations to copy. It sends no messages.
- CSV export, campaign-day selection, a three-project selector, and a confirmed demo reset.
- Registration and model persistence in browser storage, with an in-memory fallback when storage is blocked.

The refreshed demo starts with 270 labelled fictional registrations on day 4. Valid records already saved by the original prototype are preserved. Reset demo restores the new sample campaign. The counts displayed throughout both views stay synchronized.

## Model and scope

The campaign brief keeps the original ₹2,000 budget and 500-registration target. The starting forecast is 500; a ₹2,400 scenario forecasts 600 and is explicitly marked above budget. Relative channel yields are assumed: campus 1.2, WhatsApp 1.1, creator 0.8, paid 0.5. These are normalized against the starting mix (38/29/19/14) and a baseline ₹4 per registration. The displayed channel allocations sum exactly to the projected total.

All registrations are a simulation. Records are local to this device and browser origin; links carry attribution but do not synchronize databases across devices. There is no connected MongoDB, messaging service, identity verification, or organizer authentication. Workshop schedule and tools remain to be confirmed. No NxtWave affiliation is implied.

The photographs are reused from the user-provided screenshots through SVG viewports with embedded image data, so the site also works offline. Replace these with original photographs if full-resolution source assets become available.

## Verification

```powershell
npm test

# Optional browser tests
npm install
npx playwright install chromium
npm run test:browser
```

The original registration, deduplication, attribution, forecast, and CSV-safety tests pass. The redesign was also tested in headless Chrome for desktop/mobile overflow (320, 390, 768, 1024, 1440, and 1996 pixels), rendering, asset loading, scenario persistence, registration and reload persistence, duplicate handling, referral links, toolkit selection, CSV download, reset, offline-site loading, and blocked-storage fallback. Browser tests report no JavaScript errors. Test screenshots go to the ignored `tmp/redesign-review` directory.

Browser tests use the Playwright development dependency. To use an installed browser instead of Playwright's downloaded Chromium, set `CHROME_PATH` to its executable. The site itself has no runtime dependencies.

## Earlier challenge materials

The two-page growth plan, AI notes, walkthrough script, and earlier demo video remain in `submission`. They describe the earlier prototype. The website source at the repository root is the current design.
