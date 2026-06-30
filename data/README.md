# Regional and reference data

Static datasets consumed by `@list-price-plus/core`. Versioned with the extension; optionally updated remotely in Pro tier.

## Planned files

| File | Description |
|------|-------------|
| `regional/utility-rates.json` | Electric, gas, water benchmarks by state / climate zone |
| `regional/insurance-index.json` | HO-3 and landlord policy multipliers |
| `regional/tax-rates-effective.json` | Fallback effective property tax rates |
| `lifespans/components.json` | Roof, HVAC, water heater, pool equipment lifespans and cost bands |
| `credit/mortgage-rate-spreads.json` | Credit tier spreads vs. baseline rate |

## Example lifespan entry (draft)

```json
{
  "roof_asphalt_shingle": {
    "lifespanYears": 25,
    "replacementCostPerSqft": { "low": 4, "mid": 5.5, "high": 8 }
  }
}
```

## Updating data

Non-developers can edit JSON with schema validation (future: JSON Schema + CI check).

Do not commit scraped listing HTML in this folder.
