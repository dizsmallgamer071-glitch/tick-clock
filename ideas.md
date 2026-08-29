# Design Directions

## Approach 1 — Quiet Cupertino
**Very Brief Intro:** A luminous, restrained interface inspired by Apple’s native utility apps: generous breathing room, crisp system typography, and a soft material surface that lets the time remain the only true focal point.

**Probability:** 0.07

## Approach 2 — Paper Console
**Very Brief Intro:** A tactile editorial clock with warm off-white paper, dark ink numerals, and small engineering annotations that make the interface feel like a carefully typeset object.

**Probability:** 0.04

## Approach 3 — Night Signal
**Very Brief Intro:** A dark, cinematic time display built around deep graphite, cool-blue glows, and a precise signal-like rhythm. It feels calm, nocturnal, and slightly futuristic without becoming cyberpunk.

**Probability:** 0.08

# Chosen Approach — Quiet Cupertino

## Design Movement
Contemporary Swiss-influenced minimalism filtered through iOS utility design: restrained surfaces, optical alignment, and typography-led hierarchy.

## Core Principles
1. **Time is the hero:** the current time owns the visual center; all supporting information stays quiet and legible.
2. **Material before decoration:** depth comes from translucency, blur, faint borders, and light rather than ornamental graphics.
3. **Optical calm:** use generous whitespace, measured type scale, and subtle motion so the interface feels composed at every second.
4. **Functional delight:** every control exists to improve the clock experience, not to add interface noise.

## Color Philosophy
A milky cloud-white base keeps the clock bright and adaptable, while a muted cobalt blue provides one ownable interactive accent. A charcoal ink tone anchors the numerals with high contrast. The palette is intentionally low-saturation so the interface feels like a native utility rather than a branded marketing page.

## Layout Paradigm
Use a full-bleed stage with an asymmetric utility rail: the clock sits slightly left of center on larger screens, while a slim contextual panel hugs the lower-right edge. On small screens the composition collapses into a single calm vertical stack. Avoid cards as the primary structure; use one continuous material plane with a few floating controls.

## Signature Elements
- A hairline cobalt progress ring around the clock controls that echoes the second hand without competing with the digits.
- A translucent bottom utility rail with a soft top highlight, like a floating iOS accessory surface.
- Tiny uppercase metadata labels with generous letter spacing for date and timezone context.

## Interaction Philosophy
Interactions should feel immediate, quiet, and reversible. Buttons respond with a short press-scale and a small color shift. Theme changes crossfade the material and text rather than snap. The clock itself never jitters or animates for show; it updates with a precise once-per-second cadence.

## Animation
Use a 160ms cubic-bezier(0.23, 1, 0.32, 1) for controls, 240ms for theme surface transitions, and a subtle opacity/translate entrance for the bottom rail. Do not animate layout dimensions. Respect `prefers-reduced-motion` by removing non-essential entrances and transitions.

## Typography System
Use **SF Pro Display** when available, with `-apple-system` as the native fallback for the primary time display; use **Inter Tight** only for compact metadata and controls if loaded. The time uses a large, slightly tightened weight with tabular numerals. The date uses medium weight and restrained tracking. Buttons use 13px semibold system text with clear sentence case.

## Brand Essence
A quiet, premium clock for people who want the time to feel present without feeling loud. Personality: **precise, calm, considered**.

## Brand Voice
Headlines and labels are short, lowercase or sentence case, and observational rather than salesy. CTAs describe the action plainly.

Example lines:
- “good morning, florida.”
- “keep the room quiet.”

## Wordmark & Logo
Use a custom geometric mark: a rounded square clock face with one elegant hand and a tiny offset spark. Never typeset the product name as the logo; the mark should be recognizable at favicon scale.

## Signature Brand Color
**Cobalt Quiet — `#2F63D8`**, a softened cobalt that reads as distinctly iOS-native while staying calmer than a default system blue.

## Implementation Notes
- Use the generated mark from `/manus-storage/ios-clock-mark_0d3d39ae.png` in the header and favicon.
- Use the generated dawn texture from `/manus-storage/ios-clock-dawn_4c433a11.jpg` as the default low-contrast light ambiance.
- Use the generated night texture from `/manus-storage/ios-clock-night_3b598186.jpg` for the optional dark mode.
- The deliverable must also be exported as a self-contained `clock.html` file so the user can open it directly without a build step.

## Style Decisions

- The clock display must visually dominate every composition; supporting headlines remain quiet contextual labels.
- The bottom utility area reads as one translucent iOS accessory rail, using hairlines and blur rather than card-like control bubbles.
- Brand presence is led by the custom geometric clock mark; the product name stays secondary.
- Cobalt Quiet appears mainly for live status, active controls, and progress so the accent remains intentional.

## TICK. Brand Decision

The product name is **TICK.** It is compact, direct, and unmistakably connected to a live clock without sounding decorative. The period gives the name a firm endpoint and a small editorial edge.

The alignment system uses one outer content gutter, one centered hero axis, and one shared accessory width. Desktop layouts align the brand, hero copy, clock readout, progress ring, rail, and footer to this same measured frame. Mobile layouts collapse to a single column while preserving the same center axis and consistent horizontal inset.

## Premium Expansion Direction

TICK. now behaves like a focused utility rather than a static page. Full-screen mode becomes a first-class presentation state with a visible exit hint, keyboard escape support, and an always-available compact control. The Clock tab gains quick focus mode and preset controls, while Settings remains the source of truth for deep customization.

The expanded interaction language stays quiet: presets are named **Dawn**, **Ink**, and **Focus**; the full-screen state removes nonessential chrome but keeps the time, date, progress ring, and a subtle exit affordance; and all transient feedback uses a compact toast rather than disruptive dialogs. Alignment remains governed by the shared frame gutter.
