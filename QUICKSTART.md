# Quick Start Guide

## Installation (30 seconds)

```bash
cd news-globe
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

## First Look

You should see:
1. **Rotating 3D Earth** with city lights
2. **Glowing beams** rising from news locations
3. **Timeline carousel** at bottom with news cards
4. **Settings icon** (top-right) for API key
5. **Legend** (top-center) showing category colors

## How to Use

### Navigate the Globe
- **Drag** to rotate Earth
- **Scroll** to zoom in/out
- **Click beams** to read full story
- **Click carousel cards** for same effect

### Add OpenAI Integration (Optional)
1. Click settings icon (⚙️ top-right)
2. Enter OpenAI API key
3. Get key from: https://platform.openai.com/api-keys
4. Key is stored securely in your browser

### Interact with News
- **Hover over beams** → They glow and scale up
- **Click any beam** → Opens detailed modal
- **Scroll carousel** → Browse all stories
- **Breaking news** → Red badge + faster pulse

## Project Structure Overview

```
news-globe/
├── app/
│   ├── api/              # News & enrichment endpoints
│   ├── page.tsx          # Main application page
│   └── layout.tsx        # Root layout
│
├── components/
│   ├── Globe/            # 3D Earth components
│   │   ├── Earth.tsx           # Main sphere
│   │   ├── Atmosphere.tsx      # Glow effect
│   │   ├── CityLights.tsx      # Point cloud
│   │   └── NewsBeam.tsx        # Individual beams
│   │
│   ├── UI/               # User interface
│   │   ├── TimelineCarousel.tsx
│   │   ├── StoryModal.tsx
│   │   └── APIKeyInput.tsx
│   │
│   └── Scene.tsx         # R3F Canvas wrapper
│
└── lib/                  # Utilities & types
```

## Key Files to Customize

### 1. Mock News Data
**File**: `app/api/news/route.ts`

Replace `mockNews` array with real API:
```typescript
const response = await fetch('https://newsapi.org/v2/...');
```

### 2. Earth Textures
**Files**: `components/Globe/Earth.tsx`

Replace procedural textures with real ones:
```typescript
const earthTexture = useLoader(TextureLoader, '/textures/earth_diffuse_8k.jpg');
const normalTexture = useLoader(TextureLoader, '/textures/earth_normal_4k.jpg');
```

Download from: https://visibleearth.nasa.gov/

### 3. Color Scheme
**File**: `tailwind.config.ts`

Change beam colors:
```typescript
beam: {
  politics: '#your-color',
  conflict: '#your-color',
  // ...
}
```

### 4. Globe Speed
**File**: `components/Globe/Earth.tsx` (line ~18)

```typescript
meshRef.current.rotation.y += 0.001; // Adjust this value
```

## Common Issues

### Issue: Black screen
**Solution**: Check browser console for errors. Three.js requires WebGL support.

### Issue: Beams not showing
**Solution**: Ensure news data has valid `coords` with lat/lng values.

### Issue: Performance issues
**Solutions**:
- Reduce bloom intensity in `Scene.tsx`
- Lower beam count (filter stories)
- Use lower resolution textures

### Issue: API errors
**Solution**:
- Check OpenAI API key is valid
- Ensure you have API credits
- Check browser console for details

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter (if configured)
npm run lint
```

## Next Steps

### Easy Additions
1. **Add more cities** → Edit `CityLights.tsx`
2. **Change colors** → Edit `tailwind.config.ts`
3. **Adjust animations** → Tweak values in component files

### Medium Additions
4. **Real news API** → Integrate NewsAPI or RSS feeds
5. **Geocoding** → Add OpenCage or Google Maps API
6. **Clustering** → Group nearby stories to reduce clutter

### Advanced Additions
7. **Time machine** → Historical news viewing
8. **WebSocket** → Real-time updates
9. **Audio** → Sound effects for interactions
10. **VR mode** → Immersive experience

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Three.js Docs**: https://threejs.org/docs
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber
- **NASA Textures**: https://visibleearth.nasa.gov/
- **OpenAI API**: https://platform.openai.com/docs

## Get Help

- Check `README.md` for detailed documentation
- Review `FEATURES.md` for creative details
- See `DEPLOYMENT.md` for hosting options
- Open GitHub issue for bugs

## Quick Tips

💡 **Pro Tip 1**: Press F12 to open DevTools and see Three.js stats

💡 **Pro Tip 2**: Add `?debug` to URL for additional logging (implement in code)

💡 **Pro Tip 3**: Use Chrome for best WebGL performance

💡 **Pro Tip 4**: Disable browser extensions if experiencing issues

---

**Ready to explore the world of news? Start the dev server and enjoy!** 🌍✨
