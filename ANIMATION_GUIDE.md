# 🎨 Animation & 3D Components Guide

## Overview

This document explains all the new animation and 3D components added to the AI Mock Interview Platform.

---

## 📦 Components

### 1. 3D Components

#### BackgroundScene
Renders an animated 3D background with rotating geometries and stars.

```tsx
import { BackgroundScene } from '@/components/3d/BackgroundScene'

<BackgroundScene />
```

**Features:**
- Multiple rotating 3D geometries (cube, sphere, octahedron, etc.)
- Ambient and point lighting
- Starfield background
- Fixed positioning behind content

#### AnimatedCanvas
A reusable 3D canvas component that displays rotating 3D objects.

```tsx
import { AnimatedCanvas } from '@/components/3d/AnimatedCanvas'

<AnimatedCanvas className="my-custom-class" height="h-96" />
```

**Props:**
- `className`: Additional CSS classes
- `height`: Height of the canvas (default: "h-64")

---

### 2. Scroll Animation Components

#### ScrollReveal
Fades in and slides up elements when they come into view.

```tsx
import { ScrollReveal } from '@/components/ScrollAnimations'

<ScrollReveal delay={0.2} duration={0.8}>
  <YourContent />
</ScrollReveal>
```

**Props:**
- `children`: Content to animate
- `delay`: Animation delay in seconds (default: 0)
- `duration`: Animation duration in seconds (default: 0.8)
- `className`: Additional CSS classes

#### ScrollFade
Simple fade-in animation triggered by scroll.

```tsx
<ScrollFade delay={0.1}>
  <YourContent />
</ScrollFade>
```

#### ScrollScale
Elements scale up and fade in on scroll.

```tsx
<ScrollScale delay={0.2}>
  <YourContent />
</ScrollScale>
```

#### ScrollSlideLeft / ScrollSlideRight
Slide animations triggered by scroll.

```tsx
<ScrollSlideLeft delay={0.1}>
  <YourContent />
</ScrollSlideLeft>

<ScrollSlideRight delay={0.1}>
  <YourContent />
</ScrollSlideRight>
```

#### StaggerContainer & StaggerItem
Create sequential animations for multiple children.

```tsx
import { StaggerContainer, StaggerItem } from '@/components/ScrollAnimations'

<StaggerContainer staggerDelay={0.1}>
  <StaggerItem><Item1 /></StaggerItem>
  <StaggerItem><Item2 /></StaggerItem>
  <StaggerItem><Item3 /></StaggerItem>
</StaggerContainer>
```

**Props for StaggerContainer:**
- `children`: Items to stagger
- `staggerDelay`: Delay between each item (default: 0.1)
- `className`: Additional CSS classes

---

### 3. 3D Card Component

#### AnimatedCard3D
A card component that rotates based on mouse position with 3D perspective.

```tsx
import { AnimatedCard3D } from '@/components/AnimatedCard3D'

<AnimatedCard3D delay={0.1} className="w-full md:w-1/3">
  <Card>
    <YourContent />
  </Card>
</AnimatedCard3D>
```

**Props:**
- `children`: Content inside the card
- `className`: Additional CSS classes
- `delay`: Animation delay (default: 0)

**Behavior:**
- Rotates on mouse movement
- Returns to neutral on mouse leave
- Smooth 3D perspective effect

---

### 4. Simple Animation Helpers

#### PageTransition
Page enter/exit animations.

```tsx
import { PageTransition } from '@/components/AnimationHelpers'

<PageTransition>
  <div>Page content</div>
</PageTransition>
```

#### FadeIn
Simple fade-in animation.

```tsx
import { FadeIn } from '@/components/AnimationHelpers'

<FadeIn delay={0.2} duration={0.6}>
  <YourContent />
</FadeIn>
```

#### HoverScale
Scales on hover/tap.

```tsx
import { HoverScale } from '@/components/AnimationHelpers'

<HoverScale scale={1.05}>
  <Button>Hover me!</Button>
</HoverScale>
```

#### Pulse
Continuous pulse animation.

```tsx
import { Pulse } from '@/components/AnimationHelpers'

<Pulse intensity={0.5}>
  <Icon />
</Pulse>
```

#### Bounce
Bouncing animation.

```tsx
import { Bounce } from '@/components/AnimationHelpers'

<Bounce delay={0.2}>
  <YourContent />
</Bounce>
```

#### Rotate
Continuous rotation animation.

```tsx
import { Rotate } from '@/components/AnimationHelpers'

<Rotate duration={3}>
  <Icon />
</Rotate>
```

#### SlideIn
Slide animation from any direction.

```tsx
import { SlideIn } from '@/components/AnimationHelpers'

<SlideIn direction="left" delay={0.1}>
  <YourContent />
</SlideIn>
```

**Direction options:** 'left' | 'right' | 'up' | 'down'

#### Flip
3D flip animation.

```tsx
import { Flip } from '@/components/AnimationHelpers'

<Flip axis="y">
  <YourContent />
</Flip>
```

**Axis options:** 'x' | 'y'

#### Glow
Glowing shadow animation.

```tsx
import { Glow } from '@/components/AnimationHelpers'

<Glow color="purple">
  <YourContent />
</Glow>
```

**Color options:** 'blue' | 'purple' | 'pink' | 'green'

---

### 5. Global Components

#### SmoothScrollProvider
Wraps the app to enable smooth scrolling globally.

```tsx
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider'

<SmoothScrollProvider>
  <YourApp />
</SmoothScrollProvider>
```

**Features:**
- 1.2s smooth scroll duration
- Custom easing function
- Works on both desktop and mobile
- Already wrapped in App.tsx

#### ParticleEffect
Creates particles following mouse movement.

```tsx
import { ParticleEffect } from '@/components/ParticleEffect'

<ParticleEffect />
```

**Features:**
- Random colored particles
- Gravity effect
- Mouse-following particles
- Performance optimized

---

### 6. AnimatedCard3D
Advanced 3D card with mouse tracking.

```tsx
import { AnimatedCard3D } from '@/components/AnimatedCard3D'

<AnimatedCard3D className="h-64">
  <div className="bg-white rounded-lg p-6">
    <h3>3D Card Content</h3>
  </div>
</AnimatedCard3D>
```

**Features:**
- 3D rotation on mouse move
- Perspective transform
- Smooth transitions
- Works on scroll reveal too

---

## 🎨 CSS Animations

All animations are also available as Tailwind classes:

```tsx
<div className="animate-fade-in-up">Fades in and moves up</div>
<div className="animate-slide-in-left">Slides in from left</div>
<div className="animate-scale-in">Scales in</div>
<div className="animate-float">Floating animation</div>
<div className="animate-glow">Glowing animation</div>
<div className="animate-pulse-glow">Pulsing glow</div>
```

---

## 🎯 Common Use Cases

### Feature Cards Section

```tsx
import { StaggerContainer, StaggerItem } from '@/components/ScrollAnimations'

<StaggerContainer staggerDelay={0.1} className="grid grid-cols-3 gap-4">
  {features.map((feature, idx) => (
    <StaggerItem key={idx}>
      <AnimatedCard3D>
        <Card>{feature}</Card>
      </AnimatedCard3D>
    </StaggerItem>
  ))}
</StaggerContainer>
```

### Testimonials Section

```tsx
import { ScrollReveal } from '@/components/ScrollAnimations'

{testimonials.map((testimonial, idx) => (
  <ScrollReveal key={idx} delay={idx * 0.2}>
    <Card>{testimonial}</Card>
  </ScrollReveal>
))}
```

### Hero Section

```tsx
import { Bounce } from '@/components/AnimationHelpers'

<div className="text-center">
  <FadeIn>
    <h1>Welcome</h1>
  </FadeIn>
  <SlideIn direction="up" delay={0.2}>
    <p>Subheading</p>
  </SlideIn>
  <Bounce delay={0.4}>
    <Button>Call to Action</Button>
  </Bounce>
</div>
```

### Loading State

```tsx
import { Pulse, Rotate } from '@/components/AnimationHelpers'

<Pulse intensity={0.3}>
  <Rotate>
    <Loader />
  </Rotate>
</Pulse>
```

---

## ⚡ Performance Tips

1. **Use `whileInView` triggers** for scroll animations (already optimized)
2. **Limit simultaneous animations** on heavy pages
3. **Use CSS animations** for simpler effects
4. **Avoid animating layout** properties, use `transform` instead
5. **Use `once: true` in viewport** to prevent re-triggering

---

## 🔧 Customization

### Modify Animation Duration

```tsx
<ScrollReveal duration={1.2}>
  <Content />
</ScrollReveal>
```

### Adjust Stagger Delay

```tsx
<StaggerContainer staggerDelay={0.2}>
  <Items />
</StaggerContainer>
```

### Change Colors

```tsx
<Glow color="pink">
  <Content />
</Glow>
```

---

## 📱 Mobile Responsive

All animations are mobile-friendly and won't cause performance issues:

- Smooth scrolling works on touch devices
- Particle effects are throttled on mobile
- 3D effects gracefully degrade
- Animations respect `prefers-reduced-motion`

---

## 🐛 Troubleshooting

### Smooth scroll not working
- Ensure `SmoothScrollProvider` wraps your entire app
- Check if other scroll libraries are conflicting

### Animations stuttering
- Reduce animation duration
- Limit number of simultaneous animations
- Check for heavy computations during animations

### 3D components not rendering
- Ensure WebGL is supported in the browser
- Check browser console for errors
- Verify Three.js is installed

---

## 📚 Examples

See `src/pages/LandingPage.tsx` and `src/pages/Dashboard.tsx` for complete implementation examples.

---

## 🚀 What's Next

- [ ] Add more 3D shapes
- [ ] Create custom animation presets
- [ ] Add animation keyframe library
- [ ] Create animation builder UI
- [ ] Add sound effects for animations

---

Happy animating! 🎉
