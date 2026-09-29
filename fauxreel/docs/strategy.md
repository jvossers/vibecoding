# Strategy

Notes from planning conversations (Sep 2026). These are decisions and recommendations, not commitments. Update this file when plans change.

## Launch plan

- **Free, no login, no ads**, and a great mobile experience. Hosting stays near-free because everything runs in the browser: more users don't cost more money.
- The product spreads itself: every export is made to be shared. Growth should lean on that before paying for users.

### Growth, in order

1. **Domain + hosting:** register the domain (see `naming.md`) and deploy on Azure Static Web Apps (see Hosting).
2. **Privacy-friendly analytics** (Plausible or GoatCounter: no cookies, no login). Track visits, which apps and formats people use, library chats opened, and exports. Without this you can't tell when there's a "decent user base" or what people would pay for.
3. **Branding in every export:** done. There's a tiny wordmark plus an end card with the address (`BRAND_URL` in `index.html`).
4. **Search landing pages**, e.g. "fake text message video", "fake WhatsApp chat video", "iMessage chat video maker", or one page per app and per format (GIF) that opens the app preset. Competitors rank this way.
5. **Content marketing:** post the best library chats as TikToks, Reels and Shorts, each ending on the end card.
6. **Paid ads (Google Ads / Meta)** only after 2–5 show that visitors make and share videos, and on a small test budget first. Check the ad policies first:
   - **Trademarks:** app names like "WhatsApp" and "iMessage" in ad text or keywords may be restricted.
   - **Deception:** "fake" generator tools may be flagged as deceptive products.

## Monetisation (later)

- **Ads: probably not.** Sessions are short (make a video and leave), so ad income per visit is tiny, and ads would hurt the main selling point.
- **Pro tier: preferred.** Competitor Chatimator charges from $5.99/month. Keep the free tier genuinely good; Pro *adds* things.

| Free (keep) | Pro candidates |
|---|---|
| All apps, GIF/MP4/WebM, the library, share | No watermark or end card |
| | **AI-written chats** from a one-line prompt. This has a real per-use cost, so it's easy to justify charging for |
| | AI voice narration, background music, gameplay/background video |
| | 1080p, longer chats |
| | Profile photos, images, stickers, reactions |
| | More apps (Discord, X, TikTok DMs), custom themes |

- **Payment without accounts:** Lemon Squeezy, Paddle or Stripe issue a licence key that unlocks Pro and is stored on the device. AI features need a small `/api` backend to call the model and check the key.
- **Decide early what will be Pro, and never take away something that's currently free.** That's why the watermark and end card have no off switch today.

## Risks

- **Misuse:** fake chats can be used for scams, fake "evidence" or harassment. Before launch, add a short terms page, an "entertainment / parody" note, and keep the watermark.
- **Trademarks:** the app imitates the look of chat apps. That's common and generally tolerated for parody tools, but never use their logos or put their names in the product name or domain.
- **Library content:** jokes about nationalities and famous people must stay affectionate. Review new chats for tone.
- **Platform changes:** chat apps redesign their UI every so often, so themes will need occasional updates to stay convincing.

## Hosting

- **Chosen: Azure Static Web Apps.** Reasons:
  - Free managed HTTPS on custom domains, including the bare domain (it needs a DNS provider with ALIAS/ANAME records, or Azure DNS).
  - Deploys from GitHub Actions on push, with preview environments per pull request.
  - Built-in Azure Functions `/api` on the same domain (no CORS) for future dynamic features.
  - On the Standard plan (about $9/month) you can link your own backend instead (Functions, Container Apps, App Service).
- **Rejected: Storage account static website.** A custom domain works but **without HTTPS** unless you add Azure Front Door, which has a monthly base fee. `.app` domains only work over HTTPS, so it would need Front Door from day one. It also has no built-in API.
- **Other options:** App Service (overkill for static files), Container Apps (good for a backend later), GitHub Pages (free and has HTTPS, but not Azure and no backend).
- Check current Azure prices and free-tier limits before committing; they change.
