# Colors — CoinTrace AI Design System

This document is the source of truth for color usage across the landing page,
the dashboard, token pages, and all AI/analytics surfaces.

All colors are defined as HSL triplets on CSS variables in
`src/app/globals.css` and exposed to Tailwind via `tailwind.config.ts`. Both
light and dark themes use the **same variable names** with different values, so
components only need to reference semantic classes (`text-foreground`,
`text-success`, `bg-card`, …) — theme switching is automatic.

---

## 1. Design intent (extracted from existing UI)

The existing brand palette was kept unchanged. The base hues are:

| Role       | Hue family              | Used for                                          |
| ---------- | ----------------------- | ------------------------------------------------- |
| Primary    | Indigo (`234 65%`)      | Brand CTA, links, "AI" headings, gradients        |
| Accent     | Emerald (`152 45%`)     | Secondary actions, focus, chart lines, highlights |
| Success    | Emerald (darker/lighter)| Price up, bullish, drivers, validation "passed"   |
| Danger     | Red (`0 72/82%`)        | Price down, bearish, errors, validation fails     |
| Warning    | Amber (`38/43 92/96%`)  | Cautions, neutral stances, short-term tags        |
| Info       | Sky (`198/200 82/93%`)  | Quantitative signals, neutral data                |
| AI         | Violet (`258/262 68/90%`)| AI / narrative / long-term tags                 |

The landing hero gradient, soft card shadows, and "accent-glow" rings were
kept verbatim — only normalized into variables.

---

## 2. Base (shadcn/ui) tokens

These follow the standard shadcn/ui contract. Do not rename.

| Variable                 | Light                | Dark                 | Tailwind class examples                    |
| ------------------------ | -------------------- | -------------------- | ------------------------------------------ |
| `--background`           | `0 0% 99%`           | `222 35% 5%`         | `bg-background`                            |
| `--foreground`           | `222 47% 11%`        | `210 40% 98%`        | `text-foreground`                          |
| `--card`                 | `0 0% 100%`          | `220 30% 8%`         | `bg-card`, `bg-card/60`                    |
| `--card-foreground`      | `222 47% 11%`        | `210 40% 98%`        | `text-card-foreground`                     |
| `--popover`              | `0 0% 100%`          | `220 30% 8%`         | `bg-popover`                               |
| `--popover-foreground`   | `222 47% 11%`        | `210 40% 98%`        | `text-popover-foreground`                  |
| `--primary`              | `234 65% 55%`        | `234 65% 55%`        | `bg-primary`, `text-primary`               |
| `--primary-foreground`   | `0 0% 100%`          | `0 0% 100%`          | `text-primary-foreground`                  |
| `--secondary`            | `220 30% 96%`        | `220 25% 12%`        | `bg-secondary`                             |
| `--secondary-foreground` | `222 47% 20%`        | `210 40% 98%`        | `text-secondary-foreground`                |
| `--muted`                | `220 20% 96%`        | `222 28% 12%`        | `bg-muted`, `bg-muted/40`                  |
| `--muted-foreground`     | `220 13% 48%`        | `220 12% 64%`        | `text-muted-foreground`                    |
| `--accent`               | `152 45% 50%`        | `152 45% 50%`        | `bg-accent`, `text-accent`, `bg-accent/10` |
| `--accent-foreground`    | `222 47% 11%`        | `222 47% 11%`        | `text-accent-foreground`                   |
| `--destructive`          | `0 85% 60%`          | `0 85% 58%`          | `bg-destructive`                           |
| `--destructive-foreground` | `0 0% 100%`        | `0 0% 100%`          | `text-destructive-foreground`              |
| `--border`               | `220 20% 91%`        | `220 22% 16%`        | `border-border`, `border-border/60`        |
| `--input`                | `220 20% 91%`        | `220 22% 16%`        | (shadcn Input)                             |
| `--ring`                 | `234 65% 55%`        | `234 65% 55%`        | `focus-visible:ring-ring`                  |
| `--chart-1 … --chart-5`  | indigo / emerald / cyan / amber / orange | same palette tuned for dark | `text-chart-1`, recharts `hsl(var(--chart-N))` |

### When to use

- `bg-background` — page/app shell root.
- `bg-card` — elevated surfaces (cards, popovers). Use `bg-card/60 backdrop-blur` for glassy panels.
- `bg-muted` — subtle fills (skeletons, secondary chips). Prefer over arbitrary gray shades.
- `text-foreground` — primary text.
- `text-muted-foreground` — secondary/description text.
- `border-border` — all borders. Use `/60` or `/50` alpha for softer separators.
- `text-primary` / `bg-primary` — brand CTAs (indigo).
- `text-accent` / `bg-accent` — secondary/AI actions (emerald).
- `text-destructive` / `bg-destructive` — destructive CTAs (delete, confirm danger).

---

## 3. Crypto / AI semantic tokens

These are **the preferred way** to color any status or analytic state. They
automatically flip between themes and WCAG-readable shades.

| Variable                | Light            | Dark             | Tailwind class                          |
| ----------------------- | ---------------- | ---------------- | --------------------------------------- |
| `--success`             | `152 60% 36%`    | `152 55% 55%`    | `text-success`, `bg-success/10`         |
| `--success-foreground`  | `0 0% 100%`      | `222 47% 11%`    | `text-success-foreground`               |
| `--danger`              | `0 72% 48%`      | `0 82% 65%`      | `text-danger`, `bg-danger/10`           |
| `--danger-foreground`   | `0 0% 100%`      | `0 0% 100%`      | `text-danger-foreground`                |
| `--warning`             | `38 92% 45%`     | `43 96% 58%`     | `text-warning`, `bg-warning/10`         |
| `--warning-foreground`  | `0 0% 100%`      | `222 47% 11%`    | `text-warning-foreground`               |
| `--info`                | `200 82% 42%`    | `198 93% 60%`    | `text-info`, `bg-info/10`               |
| `--info-foreground`     | `0 0% 100%`      | `222 47% 11%`    | `text-info-foreground`                  |
| `--ai`                  | `262 68% 52%`    | `258 90% 72%`    | `text-ai`, `bg-ai/10`                   |
| `--ai-foreground`       | `0 0% 100%`      | `222 47% 11%`    | `text-ai-foreground`                    |

### Mapping from legacy Tailwind shades

| Before                                        | After                        |
| --------------------------------------------- | ---------------------------- |
| `text-emerald-{300..600}`, `text-green-*`     | `text-success`               |
| `bg-emerald-500/10 text-emerald-400`          | `bg-success/10 text-success` |
| `bg-emerald-400` (dot)                        | `bg-success`                 |
| `text-red-{300..600}`, `text-rose-*`          | `text-danger`                |
| `bg-red-500/10 text-red-400`                  | `bg-danger/10 text-danger`   |
| `text-amber-{300..700}`, `text-yellow-*`      | `text-warning`               |
| `text-sky-{400..500}`                         | `text-info`                  |
| `text-violet-{300..700}`, `bg-violet-500/10`  | `text-ai`, `bg-ai/10`        |

### When to use

- **success** — positive 24h change, bullish stance, drivers, resolved validation, "live" indicators.
- **danger** — negative 24h change, bearish stance, risks, API errors, generation failures.
- **warning** — neutral stance, short-term tags, severity "elevated", unsupported-token banner, validation issues list.
- **info** — quantitative/market-data signals (quant bullets in the debug drawer).
- **ai** — narrative highlights, affected tokens, long-term tags, anything framed as "AI-discovered".

Prefer the semantic class over a named hue even when you think "I just need green" — it guarantees the dark and light themes both stay readable.

---

## 4. Gradients & shadows

Already variable-driven (keep as-is). Added one new gradient for AI surfaces.

| Variable              | Light / Dark    | Tailwind class              |
| --------------------- | --------------- | --------------------------- |
| `--gradient-hero`     | near-white → mint / near-black → deep-emerald | `bg-gradient-hero` |
| `--gradient-primary`  | indigo → lighter indigo | `bg-gradient-primary`   |
| `--gradient-accent`   | indigo → emerald        | `bg-gradient-accent`    |
| `--gradient-ai`       | indigo → violet         | `bg-gradient-ai` (new)  |
| `--gradient-text`     | indigo → cyan → emerald | `bg-gradient-text` (use with `bg-clip-text`) |
| `--shadow-soft`       | soft indigo glow        | `shadow-soft`           |
| `--shadow-elegant`    | deeper indigo glow      | `shadow-elegant`        |
| `--shadow-glow`       | emerald glow            | `shadow-glow`           |
| `--shadow-card`       | card drop shadow        | `shadow-card`           |

Use `shadow-soft` on light surfaces to restore the "raised" feel that
`backdrop-blur` alone does not provide. On dark surfaces, `shadow-none` is
usually fine because the translucent card already reads as elevated.

Example of the glass-card recipe used throughout the app:

```tsx
<div className="rounded-xl border border-border/60 bg-card/80 p-4 shadow-soft backdrop-blur dark:border-border/50 dark:bg-card/40 dark:shadow-none">
  …
</div>
```

---

## 5. Theme switching

Provider: `src/components/theme/theme-provider.tsx` wraps `next-themes` and
writes to a custom `data-app-theme` attribute so the landing page (which never
mounts the provider) is unaffected. The actual `.dark` class is scoped to the
`AppShell` root div in `src/components/theme/app-shell.tsx`.

That means:

- On the landing page, `:root` (light) values always apply.
- Inside `/app/*`, `.dark` variables apply when the user selects dark or when
  the system preference is dark.
- Tailwind `dark:` variants keep working as expected inside the app subtree.

---

## 6. Charts (recharts)

All chart components already use CSS variables:

```tsx
<Area
  stroke="hsl(var(--accent))"
  fill="url(#gradient-accent-fill)"
/>
<CartesianGrid stroke="hsl(var(--border))" />
<XAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
<Tooltip contentStyle={{
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
}} />
```

Use `hsl(var(--chart-1))` … `hsl(var(--chart-5))` when a chart needs multiple
distinguishable series.

---

## 7. Usage checklist for new components

- [ ] No raw Tailwind color names (`text-emerald-400`, `bg-red-500/10`, …).
- [ ] No hex codes in JSX/CSS.
- [ ] Status colors use `success`, `danger`, `warning`, `info`, or `ai`.
- [ ] Neutrals use `foreground`, `muted-foreground`, `card`, `muted`, `border`.
- [ ] CTAs use `primary` (brand) or `destructive` (destructive action).
- [ ] Glass cards use `bg-card/80 shadow-soft dark:bg-card/40 dark:shadow-none`.
- [ ] Charts use `hsl(var(--accent))`, `hsl(var(--border))`, `hsl(var(--muted-foreground))`, `hsl(var(--card))`, `hsl(var(--foreground))`, `hsl(var(--chart-N))`.

---

## 8. Where to add new tokens

If a new semantic role emerges (e.g. `--premium` for paid-tier badges):

1. Add the HSL triplet to **both** `:root` and `.dark` in `src/app/globals.css`.
2. Register the Tailwind mapping in `tailwind.config.ts` under `theme.extend.colors`.
3. Document it in this file (section 3 table).
4. Prefer extending an existing role before introducing a new one.
