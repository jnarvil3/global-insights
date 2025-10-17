# Interactive Features & Creative Flourishes

## Visual Design

### Color Palette
The app uses a carefully chosen dark mode palette inspired by space and night-time Earth imagery:

- **Ocean**: Deep midnight blue (#0a1128) - Creates depth
- **Land**: Dark charcoal (#1a1f2e) - Subtle contrast
- **City Lights**: Warm amber (#ffb347) - Inviting glow
- **Atmosphere**: Cyan rim (#00d9ff) - Ethereal edge light
- **Beam Colors**: Category-specific gradients
  - Politics: Cyan (#4ecdc4) - Calm, diplomatic
  - Conflict: Red (#ff6b6b) - Urgent, attention-grabbing
  - Environment: Mint (#95e1d3) - Natural, fresh
  - Tech: Yellow (#f9ca24) - Innovative, bright
  - Health: Purple (#6c5ce7) - Medical, caring
  - Economy: Pink (#fd79a8) - Financial, dynamic

### Animation Philosophy
All animations follow these principles:
- **Easing**: Natural spring physics (damping: 25, stiffness: 300)
- **Duration**: 0.8-1.5s for major transitions
- **Stagger**: 50ms delays between carousel items
- **Hover States**: Subtle scale (1.1x) with smooth lerp

## 3D Globe Features

### Earth Rendering
- **Procedural Textures**: Generated at runtime for demo
- **Normal Mapping**: Adds surface detail without geometry
- **Rotation**: 0.1°/frame auto-rotation (can be paused)
- **Material**: PBR with roughness (0.9) and metalness (0.1)

### Atmosphere Shader
Custom GLSL shader creates realistic atmospheric glow:
- **Fresnel Effect**: Intensity based on viewing angle
- **Pulse**: Subtle sine wave animation for "living" feel
- **Additive Blending**: Overlays naturally on black background
- **Backside Rendering**: Only visible on rim

### City Lights
- **25 Major Cities**: Positioned using accurate lat/lng
- **Point Cloud**: Efficient WebGL rendering
- **Pulse Animation**: Sin wave on scale (0.8-1.1x)
- **Color Variation**: ±10% randomization for natural look
- **Additive Blending**: Creates authentic glow effect

## News Beam System

### Beam Geometry
- **Procedural Generation**: Built from lat/lng coordinates
- **Tapering**: 70% radius reduction from base to tip
- **Segments**: 20 height divisions, 8 radial divisions
- **Height**: 1.5 units above surface (scaled for visibility)

### Beam Shaders
Custom vertex and fragment shaders create dynamic beams:

**Vertex Shader**:
- Wave motion: `sin(time * 2.0 + position.y * 3.0) * 0.01`
- UV mapping for gradient application
- Height-based effects

**Fragment Shader**:
- Base-to-tip color gradient (category → white)
- Glow effect: `pow(1.0 - abs(uv.x - 0.5) * 2.0, 2.0)`
- Pulse: `sin(time * 3.0 + height * 5.0) * 0.2 + 0.8`
- Alpha fading at ends: `smoothstep(0.0, 0.1, height)`

### Interaction States
- **Idle**: Gentle pulse and wave motion
- **Hover**: Scale to 1.1x, increased glow intensity
- **Click**: Triggers modal with story details
- **Breaking News**: Faster pulse (urgency indicator)

## UI Components

### Timeline Carousel
- **Horizontal Scroll**: Smooth physics-based scrolling
- **Card Design**: Glassmorphism with backdrop blur
- **Hover States**: Background lightens, title shifts to cyan
- **Line Clamping**: 2-line title, 2-line summary
- **Stagger Animation**: 50ms per card on load

### Story Modal
- **Spring Animation**: Natural entrance/exit (damping: 25)
- **Glassmorphism**: 95% opacity background with blur
- **Color Theming**: Category-based accent colors
- **Meta Display**: Location, time, source with icons
- **Coordinate Display**: Shows exact lat/lng
- **Responsive**: Max-height 80vh with scroll

### Settings Panel
- **Slide In**: Right-side drawer animation
- **API Key Storage**: LocalStorage with masking
- **Status Indicators**: Green badge when connected
- **Privacy Info**: Clear explanation of data usage
- **Persistent**: Key remains between sessions

## Post-Processing Effects

### Bloom
- **Intensity**: 0.5 (subtle glow)
- **Luminance Threshold**: 0.2 (affects bright elements)
- **Smoothing**: 0.9 (soft transitions)
- **Targets**: Beams, city lights, atmosphere rim

### Future Effects (Ready to Add)
- **Chromatic Aberration**: For "retro space" aesthetic
- **Film Grain**: Cinematic texture overlay
- **Vignette**: Focus attention on center
- **God Rays**: Light shafts from sun direction

## Camera System

### OrbitControls Configuration
- **Auto-Rotate**: Disabled (user has full control)
- **Pan**: Disabled (keeps Earth centered)
- **Zoom Range**: 4-15 units (prevents inside/too far)
- **Rotation Speed**: 0.5 (smooth, not too sensitive)
- **Damping**: Enabled for natural deceleration

### Future Camera Features
- **Auto-Focus**: Animate to clicked story location
- **Preset Views**: Buttons for "North America", "Europe", etc.
- **Camera Path**: Cinematic intro sequence on load

## Performance Optimizations

### Current
- **Dynamic Import**: Scene loads client-side only (no SSR)
- **Memoization**: Geometries and materials cached
- **Buffer Geometry**: Direct GPU uploads
- **Additive Blending**: Fewer render passes

### Future
- **Frustum Culling**: Hide beams outside view
- **LOD System**: Simplified beams at distance
- **Instanced Rendering**: Reuse geometry for beams
- **Texture Compression**: KTX2 for smaller textures
- **Worker Threads**: Offload calculations

## Creative Flourishes (Implemented)

### 1. Pulsing City Lights
Cities gently pulse to simulate activity and life.

### 2. Beam Wave Motion
Subtle sine wave gives beams organic movement.

### 3. Category Color Coding
Instant visual recognition of story types.

### 4. Breaking News Pulse
Faster, more intense pulse for urgent stories.

### 5. Hover Feedback
All interactive elements respond to mouse.

## Creative Flourishes (Ready to Implement)

### 6. Ripple of Attention
When multiple users click same story, emit shockwave.

### 7. Sonic Landscape
Each category plays a musical note when centered.

### 8. Time Machine Mode
Slider to view historical news from past 48 hours.

### 9. Heatmap Toggle
Choropleth overlay showing story density per region.

### 10. Gravity Wells
Major stories create vertex displacement "dent".

### 11. Starfield Background
Parallax stars visible on night side of Earth.

### 12. Beam Trails
Dotted comet tail persists after reading story.

## Accessibility Considerations

### Current
- **Color Contrast**: White text on dark meets WCAG AA
- **Focus States**: Keyboard navigation supported
- **Semantic HTML**: Proper heading hierarchy
- **Alt Attributes**: Ready for images

### To Add
- **Screen Reader**: ARIA labels for 3D elements
- **Reduced Motion**: Respect `prefers-reduced-motion`
- **Keyboard Shortcuts**: Space to pause rotation, etc.
- **High Contrast Mode**: Alternative color scheme

## Mobile Optimizations

### Current
- **Touch Events**: onPointerOver/Out work on mobile
- **Responsive Layout**: Tailwind breakpoints
- **Dynamic Canvas**: Full viewport rendering

### To Add
- **Touch Gestures**: Pinch-to-zoom, two-finger rotate
- **Reduced Effects**: Lower bloom, fewer particles
- **Adaptive Quality**: Lower resolution on mobile
- **Battery Saver**: Pause when app backgrounded

## Data Flow

```
User Opens App
    ↓
API Key Check (LocalStorage)
    ↓
Fetch News (/api/news)
    ↓
[Optional] Enrich with OpenAI (/api/enrich)
    ↓
Geocode Locations (cached)
    ↓
Render Beams on Globe
    ↓
User Interaction Loop:
    - Rotate Globe
    - Click Beam → Open Modal
    - Scroll Carousel → View Stories
    - Click Settings → Update API Key
```

## Extension Ideas

1. **RSS Integration**: Add custom news sources
2. **Sentiment Analysis**: Color beams by positivity/negativity
3. **Social Media**: Twitter trends as additional layer
4. **Historical Archive**: Browse news from any date
5. **Story Connections**: Lines between related stories
6. **Live Updates**: WebSocket for real-time additions
7. **Filtering**: By date, category, region, source
8. **Bookmarks**: Save favorite stories locally
9. **Sharing**: Generate URLs with camera position
10. **Themes**: Day/night mode, alternate color schemes

---

This document serves as a reference for the creative and technical decisions behind the News Globe experience.
