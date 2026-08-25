# FestivalGen AI UI Direction

## Reference Ground Truth

This project is a faithful implementation of the supplied FestivalGen AI reference screens. The references define the visual hierarchy, color family, spacing, composition, navigation, and content density. The old starter UI is to be removed rather than layered beside the new interface.

## Explicit Constraints

- Match the supplied UI direction closely: soft festival-light backgrounds, white surfaces, pink-to-violet accents, dark indigo typography, rounded cards, thin lavender borders, and generous breathing room.
- Do not duplicate any section, card, navigation item, illustration, or CTA.
- Do not use clipart.
- Do not use human imagery or human avatars. Where the reference uses people, replace them with non-human brand or decorative treatments without changing the composition.
- Use only non-human festival objects and abstract decorative motifs for imagery: diyas, rangoli, lanterns, gift boxes, flowers, sweets, fireworks, and temple silhouettes.
- Keep the app and landing/auth experiences visually related: the same logo mark, typography, surface language, and accent colors should carry across routes.

## Chosen Direction: Reference-Matched Festival Editorial UI

### Design Movement

Contemporary Indian festive editorial design translated into a polished SaaS interface: tactile paper-like surfaces, celebratory color, ornamental details, and an organized planning dashboard.

### Core Principles

1. **Festive clarity:** celebration appears through color, light, and ornament while navigation and data remain easy to scan.
2. **Soft dimensionality:** layered white cards, hairline lavender borders, and low-elevation shadows create depth without heavy chrome.
3. **Decorative restraint:** use a small, intentional set of non-human motifs; never repeat the same illustration as filler.
4. **Reference fidelity:** layouts, labels, proportions, and hierarchy should visually follow the supplied screens instead of introducing a new product language.

### Color Philosophy

The palette balances warm marigold and diya light with cool indigo structure. Blush pink signals celebration and care, violet signals intelligence and craft, saffron adds moments of warmth, and pale mint/blue provide category contrast. The background stays near-white so the interface feels airy and premium rather than loud.

Signature colors: Festival Rose `#D94F9D`, Lotus Violet `#6F42C1`, Diya Saffron `#F4A63A`, Ink Indigo `#20154F`, and Mist `#FCF9FF`.

### Layout Paradigm

Use a persistent vertical navigation rail for app routes and a wide asymmetric hero for the landing page. Content should flow through editorial clusters rather than a uniform centered grid: hero copy sits left of the visual field, planning cards nest beside it, and dashboards use deliberate split panels with clear visual anchors.

### Signature Elements

- A six-petal FestivalGen flower-star mark used as the shared brand symbol and favicon.
- Fine ornamental rules, sparkles, tiny rangoli geometry, and warm diya highlights used as accents—not as repeated clipart.
- White translucent surfaces with blush-tinted shadows and 16–22px corner radii.

### Interaction Philosophy

Interactions should feel like a calm planning companion: clear active states, tactile buttons, no surprise motion, and helpful transitions between planning steps. Navigation updates should be immediate; cards can lift subtly on hover, and selected filters should use a small color shift rather than a dramatic effect.

### Animation

Use 160–220ms ease-out transitions for buttons, tabs, nav items, and cards. Add a slow, barely perceptible shimmer only to hero light accents. Avoid looping decorative motion, parallax, and attention-grabbing effects. Respect `prefers-reduced-motion`.

### Typography System

Use `Playfair Display` for the main landing headline and high-level editorial moments, paired with `DM Sans` for all interface copy, labels, forms, and dashboard data. Use 700–800 weights for display headings, 600 for section titles and controls, and 400–500 for body copy. Keep dashboard labels compact but never below 11px.

### Brand Essence

FestivalGen AI is a personal, location-aware festival planning companion for families who want thoughtful celebrations without the scattered prep. Personality: **warm, intelligent, composed**.

### Brand Voice

Headlines are inviting and specific; CTAs are action-led and reassuring; microcopy is practical with a gentle celebratory note.

Example lines:

- “Plan your festival, the smart way with AI.”
- “Everything you need, in one calm place.”

### Wordmark & Logo

The mark is a six-petal flower-star with a small diya-flame center, drawn as a clean, bold graphic symbol without text. The FestivalGen AI wordmark uses a custom two-tone treatment: Festival Rose for “FestivalGen” and Lotus Violet for “AI,” with a compact supporting descriptor beneath on large layouts.

### File-Level Reminder

Any CSS, component, or page created for this project should preserve: **reference-matched festival editorial UI, no duplicate modules, no clipart, and no human imagery.**
