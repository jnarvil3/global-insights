# News Globe - Interactive World News Visualization

A cinematic 3D web application that visualizes world news on an interactive globe, inspired by NASA's "Earth at Night" imagery. Built with Next.js, Three.js, and AI-powered news analysis.

## Features

- **Interactive 3D Globe**: Rotate, zoom, and explore a realistic Earth with city lights
- **Real-time News Beams**: Glowing beams rise from geographic locations representing news stories
- **AI-Powered Analysis**: OpenAI integration for news summarization and categorization
- **Category System**: Color-coded beams for Politics, Conflict, Environment, Tech, Health, Economy
- **Breaking News Indicators**: Pulsing beams for urgent stories
- **Timeline Carousel**: Horizontal scrolling interface for browsing headlines
- **Detailed Story Modals**: Click beams or carousel items to read full stories
- **Atmospheric Effects**: Bloom, glow, and particle effects for cinematic visuals
- **Dark Mode UI**: Glassmorphism design with minimalist aesthetics

## Tech Stack

### Frontend
- **Next.js 14** - App Router with React Server Components
- **Three.js & React Three Fiber** - 3D rendering and WebGL
- **@react-three/drei** - Three.js helpers (OrbitControls, Stars, Effects)
- **@react-three/postprocessing** - Bloom and visual effects
- **Framer Motion** - UI animations and transitions
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type safety

### Backend & Data
- **Next.js API Routes** - Server-side endpoints
- **OpenAI GPT-4 Turbo** - News enrichment and analysis
- **NewsAPI / RSS** - News aggregation (demo uses mock data)

### Shaders
- Custom GLSL shaders for atmosphere glow and news beams
- Fresnel effect for atmospheric rim lighting
- Gradient and pulsing animations for beams

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key (optional, for AI enrichment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd news-globe
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Configuration

#### OpenAI API Key
1. Click the settings icon (top-right)
2. Enter your OpenAI API key
3. The key is stored securely in your browser's localStorage

Get your API key from: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

#### Adding Real News Sources

To connect real news APIs, modify `/app/api/news/route.ts`:

```typescript
// Example: NewsAPI integration
const response = await fetch(
  `https://newsapi.org/v2/top-headlines?apiKey=${YOUR_KEY}`
);
```

## Project Structure

```
news-globe/
├── app/
│   ├── api/
│   │   ├── news/route.ts       # News aggregation endpoint
│   │   └── enrich/route.ts     # OpenAI enrichment endpoint
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main page
│   └── globals.css             # Global styles
│
├── components/
│   ├── Globe/
│   │   ├── Earth.tsx           # Earth sphere with textures
│   │   ├── Atmosphere.tsx      # Atmospheric glow shader
│   │   ├── CityLights.tsx      # Point cloud of city lights
│   │   └── NewsBeam.tsx        # Individual news beam
│   │
│   ├── UI/
│   │   ├── TimelineCarousel.tsx  # Scrolling news carousel
│   │   ├── StoryModal.tsx        # Story detail modal
│   │   └── APIKeyInput.tsx       # Settings panel
│   │
│   └── Scene.tsx               # Main R3F Canvas
│
├── lib/
│   ├── types.ts                # TypeScript definitions
│   └── coordConverter.ts       # Lat/lng to 3D conversions
│
├── shaders/
│   ├── atmosphere.vert/frag    # Atmosphere shader
│   └── beam.vert/frag          # Beam shader
│
└── public/
    └── textures/               # Earth textures (add your own)
```

## Customization

### Adding Earth Textures

For higher quality visuals, download NASA textures:

1. Visit [NASA Visible Earth](https://visibleearth.nasa.gov/)
2. Download 8K Earth textures:
   - Diffuse map (earth_diffuse_8k.jpg)
   - Normal map (earth_normal_4k.jpg)
   - City lights (city_lights_2k.jpg)
3. Place in `/public/textures/`
4. Update `Earth.tsx` to load from `/textures/`

### Customizing Colors

Edit `tailwind.config.ts` to change category colors:

```typescript
colors: {
  beam: {
    politics: '#your-color',
    conflict: '#your-color',
    // ...
  }
}
```

### Adjusting Globe Rotation Speed

In `Earth.tsx`:

```typescript
meshRef.current.rotation.y += 0.001; // Slower
meshRef.current.rotation.y += 0.005; // Faster
```

## Performance Optimization

- Beam geometry uses instanced rendering where possible
- Procedural textures for demo (swap with preloaded images)
- LOD system can be added for distant beams
- Mobile: Reduced particle count, simplified shaders

Target performance:
- Desktop: 60 FPS
- Mobile: 30 FPS

## Future Enhancements

- [ ] WebSocket for real-time news updates
- [ ] "Time Machine" mode - scrub through historical news
- [ ] Audio landscape - musical notes per category
- [ ] Heatmap toggle for story density
- [ ] Clustering algorithm to reduce beam clutter
- [ ] Advanced filters (date range, sources, urgency)
- [ ] Social sharing with camera position URLs
- [ ] Multi-language support

## Contributing

Contributions welcome! Please open an issue or PR.

## License

MIT License - See LICENSE file for details

## Acknowledgments

- NASA Visible Earth for texture inspiration
- Three.js community for excellent documentation
- OpenAI for GPT-4 API
- NewsAPI for aggregation capabilities

---

**Built with Claude Code** 🤖

For questions or support, please open an issue on GitHub.
