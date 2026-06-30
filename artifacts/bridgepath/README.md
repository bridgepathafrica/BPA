# @workspace/bridgepath — React Frontend

The Bridgepath Africa SPA: React 19 + Vite 7 + TailwindCSS 4.

## Structure

```
src/
├── App.tsx           Route definitions, QueryClient, global providers
├── lib/
│   ├── auth.tsx      AuthContext, useAuth hook, token helpers
│   └── demoAuth.ts   Demo account definitions and mock data
├── components/
│   ├── layout/       Navbar, Footer, DashboardLayout
│   ├── ui/           ShadCN primitives, CookieConsent, ChatSupport
│   ├── seo/          PageSEO wrapper (react-helmet-async)
│   └── ErrorBoundary.tsx
└── pages/            One file per route, lazy-loaded
public/
├── robots.txt
├── sitemap.xml
└── photos/           Editorial photography
```

## Running

```bash
# Development (port 5000, proxies /api/* to localhost:8080)
pnpm --filter @workspace/bridgepath run dev

# Type check
pnpm --filter @workspace/bridgepath run typecheck

# Production build → dist/
pnpm --filter @workspace/bridgepath run build
```

## Design system

| Token | Value | Usage |
|---|---|---|
| Terracotta | `#C04020` | Primary buttons, active states |
| Ink | `#1E1511` | Headlines, body text |
| Cream | `#FEF9F4` | Page backgrounds |
| Navy | `#0C1A33` | Dark nav/sections |

Fonts: **Montserrat** (headings) + **Inter** (body). All CSS variables in `src/index.css`.

## Adding a page

1. Create `src/pages/your-page.tsx` with a default export
2. Register in `src/App.tsx` under `<Switch>`
3. Add `<PageSEO>` at the top of the component
4. Add the URL to `public/sitemap.xml`
