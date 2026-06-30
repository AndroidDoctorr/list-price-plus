# Extraction decision — proceed to cost engine?

**Date:** _fill when checklist complete_  
**Tester:** _name_

## Summary

| Site | Listings tested | Price+sqft+beds | Notes |
|------|-----------------|-----------------|-------|
| Zillow | /10 | /10 | |
| FC Tucker | — | — | Adapter not shipped yet |
| RE/MAX | — | — | Adapter not shipped yet |

## Decision criteria

| Criterion | Target | Result |
|-----------|--------|--------|
| Zillow critical fields | ≥ 80% (8/10) | |
| Wrong pool flags | 0 | |
| Adapter breaks after refresh | 0 | |
| Manual edits average | ≤ 2 fields / failing listing | |

## Decision

- [ ] **Proceed to Phase 6** — cost engine on extracted + manual facts
- [ ] **Extend Phase 4/5** — fix adapter before engine
- [ ] **Pivot site priority** — deprioritize Zillow / prioritize broker sites

## Notes

_What broke, patterns seen, DOM changes, etc._

## Optional paid add-on (future)

**LLM enhancement** — not required for Phase 6. If extraction is ≥80% good:

- Ship deterministic engine first (free tier)
- Later: Pro tier optional “AI refine” for ambiguous fields (description parsing, pool disambiguation) via OpenAI/Gemini API
- User-triggered only; never auto-send listing data without consent

See [monetization.md](monetization.md).

## Recommendation (default)

If Zillow hits **8/10** on the checklist, **proceed to Phase 6**. The engine can use `fieldProvenance` and confidence to widen ranges when data is thin — manual overrides already cover the rest.
