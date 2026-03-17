# Grid Trading Bot Report - 2026-03-17

**Generated:** 2026-03-17T16:00:28.721Z
**Mode:** 🟡 SIMULATION

## Current Status

| Metric | Value |
|--------|-------|
| Symbol | ASTER-PERP |
| Current Price | $0.6605 |
| Grid Range | $0.6 - $0.8 |
| Active Levels | 3 / 21 |
| Status | IN_RANGE |
| Risk Level | LOW |

## Profitability Analysis (REALISTIC)

| Item | Amount | Notes |
|------|--------|-------|
| Gross Profit | $30.00 | Before costs |
| Trading Fees | -$0.30 | 0.1% per trade |
| Slippage | -$0.30 | 0.2% average |
| Funding Cost | -$0.45 | Per day |
| **Net Profit** | **$28.95** | After ALL costs |
| Profitability | 96.5% | Net/Gross |

## Risk Assessment

| Metric | Value |
|--------|-------|
| Break-Even Cycles | 1 trades |
| Worst-Case Loss | $300.00 | If range breaks |
| Risk/Reward Ratio | 0.097 | Net/Worst-case |
| Losing Levels | 3 (14.3%) |
| Unrealized Loss | $2.92 | Current positions |

## Grid Configuration

- **Lower Bound:** $0.6
- **Upper Bound:** $0.8
- **Grid Levels:** 20
- **Order Size:** $50
- **Leverage:** 2x
- **Stop Loss:** $0.55
- **Take Profit:** $0.85
- **Max Drawdown:** 15%

## Fee & Slippage Model

- **Trading Fee:** 0.1% per trade (entry + exit)
- **Slippage:** 0.2% average (DEX liquidity)
- **Funding Rate:** 0.1% per 8 hours (if holding)

## Performance Notes

✅ Price is within grid range. Bot is actively trading.
✅ Net profit positive after fees/slippage.

## Improvement Recommendations

- **Poor risk/reward:** Reduce leverage or narrow grid range.

## Next Check

Next monitoring cycle in 300 seconds.
