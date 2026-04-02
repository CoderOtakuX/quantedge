# Design System Specification: Editorial Financial Intelligence

## 1. Overview & Creative North Star: "The Informed Curator"
The objective of this design system is to move beyond the utilitarian "dashboard" look and toward a high-end editorial experience. We are blending the rigorous efficiency of a productivity tool (like Linear) with the sophisticated white space and typographic authority of a premium financial publication.

**Creative North Star: The Informed Curator**
The UI should feel like a custom-tailored financial briefing. We achieve this through:
*   **Intentional Asymmetry:** Breaking the rigid 12-column grid with offset content blocks and wide margins to guide the eye.
*   **Typographic Authority:** Using extreme scale shifts—massive headlines paired with micro-labels—to establish a clear hierarchy.
*   **Atmospheric Depth:** Moving away from "flat" design toward a layered, physical feel using tonal shifts instead of lines.

---

## 2. Colors & Surface Logic
The palette is rooted in a warm, "gallery" off-white (`#F5F5F3`) to reduce eye strain and provide a more premium feel than clinical pure white.

### The Surface Hierarchy (Nesting)
We do not use shadows to create depth; we use **Tonal Layering**. Think of the UI as sheets of fine paper stacked on a desk.
*   **Base Layer (`surface` / #F5F5F3):** The global page background.
*   **Secondary Layer (`surface_container_low` / #F4F4F2):** Used for large structural sections like sidebars.
*   **Priority Layer (`surface_container_lowest` / #FFFFFF):** Reserved for primary content cards and active panels. Placing a white card on the warm off-white background creates a natural, soft "lift."

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections or separate list items. 
*   Boundaries must be defined by background color shifts (e.g., a `#FFFFFF` card on a `#F5F5F3` background).
*   If a visual break is required, use a `3.5` (1.2rem) or `4` (1.4rem) spacing unit of empty space rather than a line.

### Signature Accents
*   **Primary Accent (`primary_container` / #1D4ED8):** Use sparingly for focus states and primary actions.
*   **Data Tones:** Use Semantic containers (`#F0FDF4` for Gain, `#FEF2F2` for Loss) to highlight data without overwhelming the editorial aesthetic.

---

## 3. Typography
We use **Inter** exclusively, but we treat it with the care of a serif typeface.

*   **Page Titles (Display-SM/MD):** 32px. Use the **Split Weight** technique. The first word or category is `400 (Regular)`, and the subject is `600 (Semi-bold)`. This mimics high-end magazine mastheads.
*   **Micro-Labels (Label-SM):** 11px, `weight 600`, Uppercase. Apply `0.08em` letter-spacing. These are your "navigational signposts." Use `tertiary_text` (#9CA3AF) to keep them secondary.
*   **Data Values:** Must use **Tabular Numerals** (`font-variant-numeric: tabular-nums;`). For hero metrics, use 24px+ with `weight 600` to command attention.
*   **Body Copy:** Sentence case throughout. Avoid all-caps except for Micro-Labels.

---

## 4. Elevation & Depth: The Layering Principle
Standard drop shadows are prohibited. Instead, we use "Ambient Occlusion."

*   **Ambient Shadows:** For floating elements (Modals, Popovers), use a multi-layered shadow:
    *   *Shadow 1:* 0 4px 20px rgba(17, 24, 39, 0.04)
    *   *Shadow 2:* 0 8px 40px rgba(17, 24, 39, 0.08)
*   **The "Ghost Border" Fallback:** If a container requires more definition against a white background, use a 0.5px border using `outline_variant` at 20% opacity. It should be felt, not seen.
*   **Glassmorphism:** For the Top Navbar (`56px`), use a background blur (`backdrop-filter: blur(12px)`) with a semi-transparent `surface_container_lowest` (#FFFFFF at 80%). This allows the content to bleed through as the user scrolls, maintaining a sense of place.

---

## 5. Components

### Buttons
*   **Primary:** Background `#111827`, Text `#FFFFFF`, `weight 500`. No shadow. Interaction state: subtle opacity shift to 90% on hover.
*   **Secondary:** Ghost style. No background, 0.5px `outline` border, Text `#111827`.
*   **Radius:** 10px (`md`).

### Cards & Panels
*   **Radius:** 14px (`lg`).
*   **Constraint:** No internal dividers. Use `2.5` (0.85rem) padding to group related data points. 
*   **Nesting:** Place a `#FFFFFF` card inside a `#F4F4F2` panel for secondary information hierarchy.

### Input Fields
*   **Style:** 8px (`DEFAULT`) radius, `#F9F9F7` background, 0.5px border.
*   **Focus:** Border transitions to `primary_accent` (#1D4ED8) at 1px thickness.

### Editorial Data Tables
*   **Row Height:** 48px or 56px (High density is the enemy of "Premium").
*   **Separation:** No horizontal lines. Use a subtle background change (`surface_container_low`) on hover to indicate row selection.
*   **Alignment:** Labels are left-aligned; numerical data is right-aligned for rapid scanning.

---

## 6. Do’s and Don’ts

### Do:
*   **Use White Space as a Tool:** If an element feels "stuck," don't add a border; add more padding.
*   **Layer Surfaces:** Think of the UI as a 3D space. Use `surface_container` tokens to build "platforms" for information.
*   **Respect the "Inter" Letter Spacing:** Keep it tight for headers and tracked out for small labels.

### Don’t:
*   **Don't use 1px Borders:** It breaks the "Editorial" feel and makes the app look like a generic Bootstrap template.
*   **Don't use Gradients on Surfaces:** Keep surfaces flat and matte. Use subtle gradients only for the most critical CTA "Soul" if absolutely necessary.
*   **Don't use Heavy Shadows:** If a shadow is darker than 10% opacity, it is too heavy.
*   **Don't mix radii:** Stick strictly to the defined scale (14px, 10px, 8px, 6px). Uniformity in curves is what creates professional polish.