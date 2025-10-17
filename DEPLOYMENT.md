# Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended)

Vercel is the easiest deployment option for Next.js apps:

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Deploy**:
```bash
vercel
```

3. **Follow Prompts**:
- Link to your Git repository (optional)
- Configure project settings
- Deploy!

4. **Production URL**:
Vercel will provide a URL like: `https://news-globe.vercel.app`

**Environment Variables** (if using real APIs):
- Add in Vercel Dashboard → Settings → Environment Variables
- `OPENAI_API_KEY` (server-side, if implementing server enrichment)
- `NEWSAPI_KEY` (if using NewsAPI)

### Option 2: Netlify

1. **Install Netlify CLI**:
```bash
npm i -g netlify-cli
```

2. **Build & Deploy**:
```bash
npm run build
netlify deploy --prod
```

3. **Drag & Drop**:
Alternatively, drag the `.next` folder to [netlify.com/drop](https://app.netlify.com/drop)

### Option 3: Docker

1. **Create Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

2. **Build Image**:
```bash
docker build -t news-globe .
```

3. **Run Container**:
```bash
docker run -p 3000:3000 news-globe
```

### Option 4: Static Export

For completely static hosting (GitHub Pages, S3, etc.):

1. **Update `next.config.js`**:
```javascript
module.exports = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // ... rest of config
}
```

2. **Build**:
```bash
npm run build
```

3. **Deploy `out/` folder** to any static host

**Note**: API routes won't work with static export. You'll need separate backend or use client-side only features.

## Performance Checklist

Before deploying to production:

- [ ] Add real Earth textures to `/public/textures/`
- [ ] Compress textures (use tools like squoosh.app)
- [ ] Enable image optimization (Next.js Image component)
- [ ] Add analytics (Vercel Analytics, Google Analytics)
- [ ] Configure CSP headers for security
- [ ] Add error monitoring (Sentry, LogRocket)
- [ ] Test on multiple devices/browsers
- [ ] Enable gzip/brotli compression
- [ ] Add loading states for slow connections
- [ ] Implement service worker for offline support

## Environment Variables

Create `.env.local` for development:

```bash
# Optional - for server-side enrichment
OPENAI_API_KEY=sk-...

# Optional - for real news aggregation
NEWSAPI_KEY=your_key_here

# Optional - for geocoding
OPENCAGE_API_KEY=your_key_here
```

**Never commit `.env.local` to Git!**

## Custom Domain

### Vercel
1. Go to Project → Settings → Domains
2. Add your domain (e.g., `newsglobe.com`)
3. Configure DNS records as shown
4. Wait for SSL certificate (automatic)

### Netlify
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Update DNS with provided records

## Monitoring & Analytics

### Performance Monitoring
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Tracking
```bash
npm install @sentry/nextjs
```

Follow Sentry setup wizard:
```bash
npx @sentry/wizard@latest -i nextjs
```

## Scaling Considerations

### Caching Strategy
- **News Data**: Cache for 10-15 minutes (reduce API calls)
- **Earth Textures**: Long-term cache (immutable)
- **API Responses**: Use Redis or Vercel KV

### CDN Configuration
All static assets should be served via CDN:
- Vercel does this automatically
- For custom setup, use Cloudflare or AWS CloudFront

### Rate Limiting
Implement rate limiting for API routes:

```typescript
// lib/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
```

## Cost Optimization

### Vercel Free Tier Limits
- 100GB bandwidth/month
- 100 serverless function executions/day
- Unlimited static requests

**Tips**:
- Cache aggressively
- Use static generation where possible
- Implement client-side news enrichment (user provides API key)

### API Costs
- **OpenAI**: ~$0.01-0.03 per enrichment (GPT-4 Turbo)
- **NewsAPI**: Free tier = 100 requests/day
- **OpenCage Geocoding**: Free tier = 2,500 requests/day

**Optimization**:
- Cache geocoding results permanently
- Batch OpenAI requests (analyze multiple stories at once)
- Use mock data for demo deployments

## Health Checks

Add a health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
```

Monitor at: `https://your-domain.com/api/health`

## Rollback Strategy

### Vercel
- Automatic rollback via dashboard
- Every deployment is immutable
- One-click rollback to previous version

### Manual Rollback
```bash
git revert HEAD
git push origin main
```

## Security Headers

Add to `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
      ],
    },
  ];
},
```

## Pre-Launch Checklist

- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on iOS and Android
- [ ] Verify all links work
- [ ] Check console for errors
- [ ] Test with slow 3G connection
- [ ] Verify API keys are not exposed
- [ ] Add favicon and social meta tags
- [ ] Test keyboard navigation
- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Enable HTTPS only
- [ ] Add 404 and error pages
- [ ] Set up domain email forwarding
- [ ] Create social media preview images

## Post-Launch

1. **Monitor Errors**: Check Sentry/logs daily for first week
2. **Gather Feedback**: Add feedback form or email
3. **Analytics**: Review user behavior, popular stories
4. **Iterate**: Add features based on usage patterns
5. **SEO**: Submit sitemap to Google Search Console

---

Congratulations on launching your News Globe! 🌍✨
