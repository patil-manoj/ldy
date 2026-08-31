# Wash Nest — Website

Public-facing website for SEO and customer discovery. Built with Next.js 14, Tailwind CSS, and TypeScript.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Output:** Static export
- **Hosting:** Netlify

## Pages

| Path | Description |
|------|-------------|
| `/` | Homepage — hero, services, how it works, areas, CTA |
| `/services/` | Detailed services with pricing tables |
| `/contact/` | Address, phone, WhatsApp link, Google Maps |

## Local Development

```bash
cd apps/website
npm install
cp .env.example .env.local     # Edit with your phone number & address
npm run dev
```

Open http://localhost:3000

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_WHATSAPP_NUMBER=919596889663
NEXT_PUBLIC_SHOP_ADDRESS=80 Feet Rd, Mysore Bank Colony, SBM Colony, Banashankari 1st Stage, Banashankari, Bengaluru, Karnataka 560050
NEXT_PUBLIC_SHOP_PHONE=+919596889663
```

## Build

```bash
npm run build
```

Output is in `out/` directory (static HTML).

## Deploy to Netlify

### Option A: Git Integration (Recommended)

1. Push repo to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → Add new site → Import from Git
3. Select your repo
4. Set **Base directory** to `apps/website`
5. Set **Build command** to `npm run build`
6. Set **Publish directory** to `apps/website/out`
7. Add environment variables
8. Deploy

### Option B: CLI

```bash
npm i -g netlify-cli
cd apps/website
netlify deploy --prod --dir=out
```

## Custom Domain

1. In Netlify → Site settings → Domain management → Add custom domain
2. Update DNS records as instructed by Netlify
3. SSL is automatic

## SEO

- JSON-LD LocalBusiness schema in `<head>`
- Proper `<title>` and `<meta description>` per page
- Semantic HTML with proper heading hierarchy
- Area-rich content for local SEO
- Mobile-first responsive design
- Static export = fast load times

## Updating Content

- **Services/Pricing:** Edit `src/app/services/page.tsx`
- **Areas:** Update `NEXT_PUBLIC_AREAS_SERVED` in `.env.local`
- **Phone/Address:** Update `.env.local` values
- **Homepage sections:** Edit components in `src/components/`

After changes, push to GitHub — Netlify auto-deploys.
