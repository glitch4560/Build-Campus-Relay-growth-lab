# AI + learning notes

This is an AI-assisted design log for the simulation. It describes decisions in this build, not student interviews, campaign outcomes or personal experience. Review and rewrite the first-person video script in your own voice before submitting.

## What changed between the first idea and final solution?

The initial concept was a campus referral tracker. As the funnel was worked through, the asset became a small operating system for the campaign: registration, referral attribution, duplicate checks, source-level counts and a sensitivity calculator. The reason was practical: a referral link alone cannot tell the organizer whether the campaign is on pace, or whether 500 is plausible. A plain landing page would explain the event but would not solve that distribution problem.

The final plan also makes the missing workshop details explicit. The AI study helper is a proposed project, not a promised NxtWave curriculum. The date, tool access and facilitator must be confirmed before a real launch.

## Three prompt-to-decision examples

### 1. Work backward from 500

**What was asked:** Using the supplied seven-day and ₹2,000 constraints, prioritize the channels and show how 500 registrations could arrive.

**What AI proposed:** Twenty champions reaching 3,000 students, four partners reaching 800, and 200 peer invitations; 360 + 80 + 60 registrations at the stated conversion assumptions.

**What was changed:** The plan explicitly requires distinct eligible audiences, counts repeat emails once and does not treat group membership as reach. The forecast includes an overlap control. A 10% haircut reduces the forecast to 450. The numerical funnel is a hypothesis to validate, not a claimed benchmark.

**Learning:** Correct arithmetic is not enough; source overlap and access can make a plausible-looking plan fail.

### 2. Make referrals measurable

**What was asked:** Build one working asset that supports champion-led distribution and can be demonstrated without contacting students.

**What AI proposed:** A source-coded registration and referral tracker with seeded records, a dashboard, shareable links and CSV export.

**What was changed:** Add first-touch attribution so a repeat registration cannot move credit to a new source. Check source codes, preserve the original record, require final-year eligibility and sample-data consent, and escape exported spreadsheet cells that could be interpreted as formulas. Use synthetic data only.

**Learning:** More features are useful only when they improve an actual campaign decision or prevent a measurement error.

### 3. Stress-test the fallback

**What was asked:** Show what happens when campus click-through falls to 25% and form conversion to 30%.

**What AI proposed:** Add enough new campus groups to close the gap. The resulting forecast is 365; 12 more groups of 150 at the same rates could cover the 135-registration gap.

**What was changed:** Reject “just add 12 groups” as an automatic solution. The contingency covers 10 extra ₹50 honoraria, not 12. The plan needs conversion improvement, at least two additional volunteers, or an honest lower forecast. Start intervention on day 2, not the last evening.

**Learning:** A fallback must fit the same budget and time constraints as the original plan.

## What AI suggested that was deliberately rejected, and why

The most concrete rejected recommendation was treating additional reach as a guaranteed fix for low conversion. Recruiting 12 more active groups in a short campaign is unproven, and paying 12 more champions would exceed the reserve. The final version exposes that shortfall rather than hiding it.

Other ideas excluded by design: cash per referral (could incentivize duplicates and irrelevant registrations); mandatory sharing before access (adds friction); a WhatsApp API bot (unnecessary setup and spending for a simulation); and elaborate AI lead scoring or project evaluation (does not address the immediate registration goal). These are design alternatives considered here, not claims about a separate recorded conversation.

## If there were another 24 hours

1. Implement shared server-side storage and organizer authentication, then add email verification and signed source events. Test the same referral link across two devices and ensure the organizer sees one shared count.
2. Confirm the facilitator, date, project and free tool prerequisites. Build the actual 20-second project preview.
3. Conduct five student conversations and a small approved two-group pilot in a real execution setting; measure unique clicks and completed registrations. In this simulation, prepare the interview questions and event instrumentation without contacting anyone.

## Validation actually performed

Automated checks cover seed uniqueness, email normalization, deduplication, first-touch attribution, peer attribution, unknown codes, invalid email, eligibility, consent, base/lower/overlap forecasts, and CSV formula escaping. Browser and artifact checks are recorded in the submission README after completion.
