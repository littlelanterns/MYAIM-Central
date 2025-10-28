# Scrapbook Decorations - Usage Guide

Your beautiful decorative elements are now ready to use! Here's how to add that warm, scrapbook aesthetic to any page.

## Quick Start

```tsx
import {
  GoldThumbtack,
  TealThumbtack,
  PinkThumbtack,
  PaperClip,
  WashiTape,
  CrayonStar,
  StarCluster,
  NotebookSpiral,
  DecoratedCard,
  ScrapbookSection
} from '../components/decorations/ScrapbookDecorations';
```

## Individual Elements

### Thumbtacks - Pin Cards to the Board!

```tsx
// Add a teal thumbtack to pin a card
<div style={{ position: 'relative' }}>
  <TealThumbtack
    size={50}
    rotation={15}
    style={{ position: 'absolute', top: -15, left: 20 }}
  />
  <div className="your-card">
    Card content here
  </div>
</div>

// Rotate for variety!
<GoldThumbtack rotation={-10} />
<PinkThumbtack rotation={25} />
```

### Paper Clip - Clip Documents Together

```tsx
<PaperClip
  size={70}
  rotation={45}
  style={{ position: 'absolute', top: 10, right: 10 }}
/>
```

### Washi Tape - Stick Things Down

```tsx
// Horizontal tape across top
<WashiTape
  size={300}
  style={{ position: 'absolute', top: 0, left: 0 }}
/>

// Vertical tape on side (rotate 90deg)
<WashiTape
  rotation={90}
  style={{ position: 'absolute', left: 0, top: 0 }}
/>
```

### Stars - Add Whimsy!

```tsx
// Single hand-drawn star
<CrayonStar size={50} rotation={15} />

// Cluster of stars
<StarCluster size={120} rotation={-10} />
```

### Notebook Spiral - Page Edges

```tsx
// Left edge spiral binding
<NotebookSpiral
  style={{
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%'
  }}
/>
```

## Pre-Composed Components

### DecoratedCard - Quick Card with Decoration

```tsx
// Card with clip on top
<DecoratedCard decorationType="clip">
  <h3>Task List</h3>
  <ul>
    <li>Grocery shopping</li>
    <li>Pick up kids</li>
  </ul>
</DecoratedCard>

// Card with spiral binding
<DecoratedCard decorationType="spiral" rotation={3}>
  Note content
</DecoratedCard>

// Card with washi tape
<DecoratedCard decorationType="tape" rotation={-2}>
  Reminder content
</DecoratedCard>
```

### ScrapbookSection - Full Section with Multiple Decorations

```tsx
<ScrapbookSection
  title="Family Calendar"
  decorations={['clip', 'stars', 'lila']}
>
  {/* Your calendar content */}
</ScrapbookSection>
```

## Real-World Examples

### Archives Page - Folders as Polaroids

```tsx
<div style={{ position: 'relative', display: 'inline-block' }}>
  {/* Polaroid frame with thumbtack */}
  <PolaroidFrame size={250} rotation={-3} />
  <GoldThumbtack
    size={40}
    style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)' }}
  />
  {/* Folder icon/image goes inside polaroid */}
</div>
```

### Dashboard Widget - Pinned Note Style

```tsx
<div style={{ position: 'relative', padding: '2rem', background: '#FFFACD', borderRadius: '4px' }}>
  {/* Thumbtacks at top corners */}
  <TealThumbtack
    size={45}
    rotation={-5}
    style={{ position: 'absolute', top: -12, left: 20 }}
  />
  <PinkThumbtack
    size={45}
    rotation={8}
    style={{ position: 'absolute', top: -12, right: 20 }}
  />

  <h3>Today's Tasks</h3>
  {/* Task content */}

  {/* Add some stars for fun */}
  <CrayonStar
    size={40}
    rotation={20}
    style={{ position: 'absolute', bottom: 10, right: 15, opacity: 0.6 }}
  />
</div>
```

### Best Intentions - Sticky Note Wall

```tsx
{goals.map((goal, index) => (
  <div
    key={goal.id}
    style={{
      position: 'relative',
      padding: '1.5rem',
      background: pastelColors[index],
      transform: `rotate(${rotations[index]}deg)`,
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }}
  >
    {/* Random thumbtack color */}
    {index % 3 === 0 && <TealThumbtack size={40} style={{ position: 'absolute', top: -10, left: '50%' }} />}
    {index % 3 === 1 && <GoldThumbtack size={40} style={{ position: 'absolute', top: -10, left: '50%' }} />}
    {index % 3 === 2 && <PinkThumbtack size={40} style={{ position: 'absolute', top: -10, left: '50%' }} />}

    {goal.title}
  </div>
))}
```

### Washi Tape Borders

```tsx
// Top border
<WashiTape
  size="100%"
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    opacity: 0.7
  }}
/>

// Corner accent
<WashiTape
  rotation={45}
  size={150}
  style={{ position: 'absolute', top: -20, right: -20 }}
/>
```

## Styling Tips

1. **Rotation** - Always add slight rotation (3-15deg) for authentic scrapbook feel
2. **Layering** - Use z-index to layer decorations over/under content
3. **Shadows** - Thumbtacks have built-in shadows, but you can add more with CSS
4. **Opacity** - Use 0.6-0.9 opacity for subtle background decorations
5. **Random Variations** - Vary rotation/position for each repeated element

## Color Combinations

**Warm & Cozy:**
- Gold thumbtacks + sage washi tape
- Pink thumbtacks + yellow stars

**Professional:**
- Teal thumbtacks + neutral paper clips
- Gold accents only

**Playful:**
- Mix all colors!
- Lots of stars and doodles

## Performance Notes

- All images are optimized PNGs with transparency
- Use `pointerEvents: 'none'` (already built-in) to prevent click interference
- Decorations are set to `userSelect: 'none'` so they don't get selected

## Available Decorations

**Thumbtacks (50px default):**
- GoldThumbtack
- TealThumbtack
- PinkThumbtack

**Clips & Tape:**
- PaperClip (60px)
- ClipboardClip (80px)
- WashiTape (200px strip)

**Doodles & Stars:**
- CrayonStar (60px single star)
- StarCluster (150px cluster)
- StarEmbellishment (100px compass star)
- SwirlArrow (120px hand-drawn arrow)

**Paper & Frames:**
- NotebookSpiral (full height)
- LinedPaperTape (200px)
- GraphPaper (300px)
- PolaroidFrame (300px)

**Special:**
- SittingLila (200px - your AI mascot!)

Enjoy decorating! 🎨
