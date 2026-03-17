
FILE: /docs/market-data.md
```md
# Market Data Layer

## Status
- **Market data architecture:** Confirmed
- **Binance source-of-truth decision:** Confirmed
- **Implementation status:** Completed for the core layer

## 1. Purpose

Provide a unified market data layer for the app using Binance as the source of truth.

This layer powers:
- dashboard KPI cards
- chart
- top movers
- token pages
- AI workflows

## 2. Final provider decision

### Confirmed
Binance replaced CoinGecko for:
- current prices
- chart data
- top movers

### Why
- CoinGecko returned 401 errors
- CoinGecko free tier was too restrictive
- Binance public market data better fits a crypto dashboard product

## 3. Service structure

### Confirmed modules
- `services/market/binance.ts`
- `services/market/get-current-prices.ts`
- `services/market/get-market-chart.ts`
- `services/market/get-top-movers.ts`

## 4. API routes

### Confirmed
- `GET /api/market/prices`
- `GET /api/market/chart`
- `GET /api/market/top-movers`

## 5. Supported assets

### Confirmed
- BTC → `BTCUSDT`
- ETH → `ETHUSDT`

### Future extensibility discussed
- SOL and future assets

## 6. Current prices

### Confirmed expectations
Prices route should expose:
- current price
- 24h change
- volume if available

### UI consumers
- dashboard KPI cards
- token header / stats

## 7. Chart data

### Confirmed chart ranges
- 1D
- 1W
- 1M
- 1Y
- ALL

### Suggested Binance mappings discussed
A pragmatic mapping was explicitly discussed:

| Range | Interval | Limit |
|---|---|---:|
| 1 Day | 5m | 288 |
| 1 Week | 30m | 336 |
| 1 Month | 2h | 360 |
| 1 Year | 1d | 365 |
| All | 1d | 1000 |

### Chart behavior
- asset-specific
- range-specific
- should not cause full page reload
- should reuse the same internal chart layer across dashboard and token pages

## 8. Top Movers

### Confirmed expectations
Top Movers should return:
- symbol
- current price
- 24h percent change

### MVP note
At minimum BTC and ETH should be represented consistently with the same data source.

## 9. Architecture rules

### Confirmed
- do not fetch Binance directly from components
- always use internal API routes or shared services
- all price/chart UI must use the same source of truth

## 10. Caching

### Confirmed
Use pragmatic caching / revalidation.

### Discussed guidance
- prices can refresh every ~15–30 seconds
- chart data should not refetch unnecessarily
- chart route can be cached/revalidated
- exact implementation mechanism not finalized

## 11. Data consistency requirements

### Confirmed
BTC and ETH prices must be consistent across:
- dashboard KPI cards
- main chart
- top movers
- token pages

This was emphasized as an important requirement.

## 12. Known constraints

### Confirmed
- CoinGecko should not be used anymore for price/chart flows
- market data layer must be the single source of truth