
FILE: /docs/api-surface.md
```md
# API Surface

## Status
- **Core market/news/AI routes:** Confirmed
- **Some future routes:** Planned
- **Exact request/response details:** Partially specified

## 1. Market APIs

### GET /api/market/prices
#### Purpose
Return current market prices and 24h stats for supported assets.

#### Expected consumers
- dashboard KPI cards
- token header / token stats

#### Confirmed behavior
- should use shared Binance-backed market layer
- should support BTC and ETH
- should later remain extensible

#### Response shape
Partially specified, but includes:
- current price
- 24h change
- volume if available

---

### GET /api/market/chart
#### Purpose
Return chart data for an asset and range.

#### Inputs
- asset
- range

#### Confirmed ranges
- 1D
- 1W
- 1M
- 1Y
- ALL

#### Expected consumers
- dashboard chart
- token chart

#### Response shape
Partially specified as normalized chart points:
```ts
{
  time: string,
  price: number
}