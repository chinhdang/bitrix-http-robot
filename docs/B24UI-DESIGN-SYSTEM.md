# Bitrix24 UI Kit (b24ui) Design System Reference

> Source: https://github.com/bitrix24/b24ui
> Docs: https://bitrix24.github.io/b24ui/
> Version: v2 (Tailwind CSS v4 + Reka UI + Tailwind Variants)

## 1. Design Tokens

### 1.1 Color System

**Base Grayscale (Light Theme)**
```
--ui-color-base-0: #000      (black solid)
--ui-color-base-1: #333      (primary text)
--ui-color-base-2: #525c69   (secondary text)
--ui-color-base-3: #828b95   (subtle/muted text)
--ui-color-base-4: #a8adb4   (placeholder, icons)
--ui-color-base-5: #c9ccd0   (borders, dividers)
--ui-color-base-6: #dfe0e3   (light borders)
--ui-color-base-7: #edeef0   (card borders, bg secondary)
--ui-color-base-8: #fff      (white/background)
```

**Accent Colors (Light Theme)**
```
Primary:    #0075ff  (--ui-color-accent-main-primary)
Primary Alt:#1f86ff  (--ui-color-accent-main-primary-alt)
Primary 2:  #7ab7ff  (--ui-color-accent-main-primary-alt-2)
Success:    #1bce7b  (--ui-color-accent-main-success)
Alert:      #ff5752  (--ui-color-accent-main-alert)
Warning:    #faa72c  (--ui-color-accent-main-warning)
Link:       #0154c8  (--ui-color-accent-main-link)
```

**Semantic Background Colors**
```
Primary BG:   #fff        (--ui-color-bg-content-primary)
Secondary BG: #fbfbfb     (--ui-color-bg-content-secondary)
Tertiary BG:  #f1f4f6     (--ui-color-bg-content-tertiary)
Theme BG:     var(--ui-color-gray-05) = #eef2f4
```

**Component Style Classes (CSS classes that set --b24ui-* vars)**
- `.style-filled` / `.style-filled-success` / `.style-filled-alert` / `.style-filled-warning`
- `.style-tinted` / `.style-tinted-success` / `.style-tinted-alert`
- `.style-outline` / `.style-outline-accent` / `.style-outline-success`
- `.style-plain` / `.style-plain-accent` / `.style-selection`
- Each sets: `--b24ui-background`, `--b24ui-border-color`, `--b24ui-color`, `--b24ui-icon`

**Text Utility Classes**
```css
.text-dimmed       /* lightest text */
.text-muted        /* light text */
.text-description  /* = --ui-color-design-plain-na-content = base-3 */
.text-legend       /* = --ui-color-design-plain-na-content = base-3 */
.text-label        /* = --ui-color-design-plain-content = base-2 */
```

**Divider Colors**
```
--ui-color-divider-accent:              #e2e2e2
--ui-color-divider-default:             #f0f0f0
--ui-color-divider-less:                #f7f7f7
--ui-color-divider-vibrant-accent-more: rgba(0,0,0,0.15)
--ui-color-divider-vibrant-accent:      rgba(0,0,0,0.08)
```

### 1.2 Typography

**Font Families**
```
--ui-font-family-system: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Arial, sans-serif
--ui-font-family-primary: var(--ui-font-family-system)
--ui-font-family-system-mono: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace
```

**Font Sizes (px)**
```
--ui-font-size-7xs: 7px    --text-7xs
--ui-font-size-6xs: 8px    --text-6xs
--ui-font-size-5xs: 9px    --text-5xs
--ui-font-size-4xs: 10px   --text-4xs
--ui-font-size-3xs: 11px   --text-3xs
--ui-font-size-xs:  12px   --text-xs
--ui-font-size-sm:  13px   --text-sm
--ui-font-size-md:  14px   --text-md / --text-base
--ui-font-size-lg:  15px   --text-lg
--ui-font-size-xl:  16px   --text-xl
--ui-font-size-2xl: 18px   --text-2xl
--ui-font-size-3xl: 22px   --text-3xl
--ui-font-size-4xl: 24px   --text-4xl
--ui-font-size-5xl: 28px   --text-5xl
```

**Font Weights**
```
--ui-font-weight-thin:       100
--ui-font-weight-extra-light:200
--ui-font-weight-light:      300
--ui-font-weight-regular:    400 (= --ui-font-weight-normal)
--ui-font-weight-medium:     500
--ui-font-weight-semi-bold:  600
--ui-font-weight-bold:       700
--ui-font-weight-extra-bold: 800
--ui-font-weight-black:      900
```

**Line Heights**
```
--ui-font-line-height-reset: 1
--ui-font-line-height-3xs:   1.2
--ui-font-line-height-2xs:   1.3
--ui-font-line-height-sm:    1.35
--ui-font-line-height-md:    1.4
--ui-font-line-height-lg:    1.5
--ui-font-line-height-xl:    1.62
--ui-font-line-height-2xl:   1.75
--ui-font-line-height-3xl:   2
```

**Heading Scale**
```
H1: 28px, weight 300, line-height 1.2
H2: 24px, weight 300, line-height 1.3
H3: 22px, weight 300, line-height 1.3
H4: 18px, weight 400, line-height 1.35
H5: 16px, weight 400, line-height 1.35
H6: 14px, weight 600, line-height 1.4
```

**Body Text Scale**
```
txt-xs: 12px, weight 400, line-height 1.4
txt-sm: 13px, weight 400, line-height 1.4
txt-md: 14px, weight 400, line-height 1.4
txt-lg: 15px, weight 400, line-height 1.4
```

**Letter Spacing**
```
--tracking-tighter: -0.05em
--tracking-tight:   -0.025em
--tracking-normal:  0
--tracking-wide:    0.025em
--tracking-wider:   0.05em
--tracking-widest:  0.1em
```

### 1.3 Spacing

```
--spacing-none: 0px
--spacing-3xs:  2px
--spacing-2xs:  4px
--spacing-2xs2: 6px
--spacing-xs:   8px
--spacing-xs2:  10px
--spacing-sm:   12px
--spacing-sm2:  14px
--spacing-md:   16px
--spacing-md2:  18px
--spacing-lg:   20px
--spacing-lg2:  22px
--spacing-xl:   24px
--spacing-xl2:  26px
--spacing-2xl:  28px
--spacing-3xl:  32px
--spacing-4xl:  36px
--spacing-5xl:  40px
--spacing-6xl:  48px
--spacing-7xl:  64px
--spacing-8xl:  72px
```

### 1.4 Border Radius

```
--ui-border-radius-none: 0
--ui-border-radius-3xs:  2px
--ui-border-radius-2xs:  4px    (buttons, fields default)
--ui-border-radius-xs:   6px
--ui-border-radius-sm:   8px    (form sections, collapse blocks)
--ui-border-radius-md:   10px   (cards, alerts, grids)
--ui-border-radius-lg:   12px
--ui-border-radius-xl:   14px
--ui-border-radius-2xl:  16px
--ui-border-radius-3xl:  20px
--ui-border-radius-circle: 50%
--ui-border-radius-pill: 99rem
```

**Component-specific radius tokens:**
```
--ui-btn-radius:                     var(--ui-border-radius-2xs) = 4px
--ui-field-border-radius:            var(--ui-border-radius-2xs) = 4px
--ui-alert-border-radius:            var(--ui-border-radius-md)  = 10px
--ui-form-section-border-radius:     var(--ui-border-radius-md)  = 10px
--ui-form-collapse-block-border-radius: var(--ui-border-radius-sm) = 8px
```

### 1.5 Shadows

**Standard**
```
--shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
--shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
--shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25)
```

**Directional (bottom as example)**
```
--ui-shadow-bottom-2xs: 0px 1px 2px 0px rgba(0,0,0,0.06)
--ui-shadow-bottom-xs:  0px 2px 2px 0px rgba(0,0,0,0.07)
--ui-shadow-bottom-s:   0px 2px 4px 0px rgba(0,0,0,0.08)
--ui-shadow-bottom-m:   0px 3px 4px 0px rgba(0,0,0,0.08)
--ui-shadow-bottom-l:   0px 4px 5px 0px rgba(0,0,0,0.08)
--ui-shadow-bottom-xl:  0px 6px 10px 0px rgba(0,0,0,0.1)
--ui-shadow-bottom-2xl: 0px 8px 10px 0px rgba(0,0,0,0.1)
```

### 1.6 Border Widths
```
--ui-border-width-thin:   1px
--ui-border-width-medium:  1.5px
--ui-border-width-thick:  2px
```

### 1.7 Blur
```
--ui-bg-blur-none:       none
--ui-bg-blur-less-more:  blur(2px)
--ui-bg-blur-less:       blur(6px)
--ui-bg-blur-default:    blur(12px)
--ui-bg-blur-accent:     blur(24px)
--ui-bg-blur-accent-more:blur(48px)
```

---

## 2. Component Size Variants

### Input Sizes (height, font-size, icon-size)
| Size | Height | Font Size Var | Icon Size | Padding |
|------|--------|---------------|-----------|---------|
| xss  | 20px   | --ui-font-size-4xs (10px) | 12px | px-1 |
| xs   | 24px   | --ui-font-size-xs (12px)  | 14px | px-1 |
| sm   | 28px   | --ui-font-size-sm (13px)  | 16px | px-1.5 |
| **md** | **34px** | **--ui-font-size-lg (15px)** | **18px** | **px-2** |
| lg   | 38px   | --ui-font-size-lg (15px)  | 22px | px-2 |
| xl   | 46px   | --ui-font-size-2xl (18px) | 22px | px-2 |

Default: `md`, Color: `air-primary`

### Button Sizes
| Size | Classes |
|------|---------|
| xss  | h-[20px] gap-1 text-4xs px-2 |
| xs   | h-[24px] gap-1 text-xs px-2 |
| sm   | h-[28px] gap-1.5 text-sm px-2.5 |
| md   | h-[34px] gap-1.5 text-lg px-3 |
| lg   | h-[38px] gap-2 text-lg px-3 |
| xl   | h-[46px] gap-2 text-2xl px-3 |

Default: `md`, Color: `air-secondary-accent`

### Button Color Variants
```
air-primary          (filled blue)
air-primary-success  (filled green)
air-primary-alert    (filled red)
air-primary-warning  (filled orange)
air-primary-copilot  (filled purple)
air-secondary-accent (outline blue)
air-secondary-accent-2
air-secondary-success
air-secondary-alert
air-secondary-na     (outline gray)
air-secondary-black
air-boost            (gradient special)
```

### Tabs Sizes
| Size | Trigger Classes |
|------|----------------|
| xss  | px-2 py-1 text-4xs gap-1 |
| xs   | px-2 py-1 text-xs gap-1 |
| sm   | px-2.5 py-1.5 text-sm gap-1.5 |
| md   | px-3 py-1.5 text-md gap-1.5 |
| lg   | px-3 py-2 text-lg gap-2 |
| xl   | px-3 py-2 text-xl gap-2 |

Default variant: `link`, Default size: `md`

### FormField Sizes
| Size | Root Font Size |
|------|---------------|
| xs   | --ui-font-size-xs (12px) |
| sm   | --ui-font-size-xs (12px) |
| md   | --ui-font-size-sm (13px) |
| lg   | --ui-font-size-md (14px) |

Default: `md`, Orientation: `vertical`

### Badge / Chip Sizes: sm, md, lg

---

## 3. Key Layout Patterns

### Container
```
base: 'w-full max-w-[1280px] mx-auto px-[22px]'
```
Single-element, no slots. Only `class` prop available.

### Card
```ts
slots: {
  root: 'overflow-hidden rounded-(--ui-border-radius-md)',  // 10px
  header: 'p-[24px] sm:px-[22px] sm:py-[15px]',
  body:   'p-[24px] sm:px-[22px] sm:py-[15px]',
  footer: 'p-[24px] sm:px-[22px] sm:py-[15px]'
}
// 28 card variants: filled, tinted, outline, plain, selection
// Default variant: 'outline'
```

### Tabs
Orientation: `horizontal` | `vertical`
Variant: `link` (with bottom/side indicator line)
Supports: icons, avatars, badges per tab

### Accordion
Type: `single` | `multiple`
Props: `collapsible`, `unmountOnHide`

### Separator
Orientation: `horizontal` | `vertical`
Accent: `default`, `accent`, `less`
Border: `solid`, `dashed`, `dotted`, `double`
Size: `thin`, `thick`

---

## 4. Form Component Patterns

### Form + FormField
```vue
<!-- FormField wraps any input with label + validation -->
<B24FormField label="URL" name="url" required>
  <B24Input v-model="url" placeholder="https://..." />
</B24FormField>
```

FormField slots: `root`, `wrapper`, `labelWrapper`, `label`, `hint`, `container`, `description`, `error`, `errorWrapper`, `errorIcon`, `help`
- `required: true` adds red asterisk after label
- `orientation`: `vertical` (stacked) or `horizontal` (side-by-side)

### Input
Slots: `root`, `base`, `leading`, `leadingIcon`, `trailing`, `trailingIcon`, `tag`
Key variants: `size`, `color`, `rounded`, `noPadding`, `noBorder`, `underline`, `highlight`, `loading`
- `color` options: `air-primary`, `air-primary-success`, `air-primary-alert`, `air-primary-warning`, `air-primary-copilot`
- Model modifiers: `nullable` (empty -> null), `optional` (empty -> undefined)

### Select
Extends Input configuration via `defuFn`.
Slots: `root`, `base`, `value`, `placeholder`, `content`, `viewport`, `item`, `label`, `separator`, `empty`
Size variants same as Input.

### Textarea
Similar structure to Input. Supports `autoresize` variant.

### Checkbox / CheckboxGroup
Checkbox: `root`, `base`, `input`, `label`
CheckboxGroup: `orientation: horizontal | vertical`, `items[]`

### RadioGroup
Props: `orientation: horizontal | vertical`, `items[]`
Item: `{ value, label, disabled }`

### Switch
Slots: `root`, `base`, `input`, `label`

### FieldGroup (formerly ButtonGroup)
Groups buttons/inputs together with connected borders.
`orientation: horizontal | vertical`, `size: sm | md | lg`

---

## 5. Compact/Dense Layout Approach

b24ui does NOT have an explicit "compact" or "dense" mode. Instead, achieve density through:

1. **Use `sm` or `xs` size variants** on all components:
   - Input `size="xs"` = 24px height, 12px font
   - Input `size="sm"` = 28px height, 13px font
   - Button `size="xs"` = 24px height
   - Tabs `size="xs"` = compact trigger padding
   - FormField `size="sm"` = 12px label font

2. **Reduce Card padding** via `b24ui` prop:
   ```vue
   <B24Card :b24ui="{ body: 'p-3', header: 'p-3' }">
   ```

3. **Use `xss` size** for maximum density:
   - Input `size="xss"` = 20px height, 10px font

4. **FormField spacing**:
   - With `useDescription=false`: wrapper gets `mb-[10px]`
   - With `useDescription=true`: wrapper gets `mb-[6px]`
   - For tighter: override via `b24ui` prop

---

## 6. Customization System (3 levels)

### Level 1: Global app.config.ts (lowest priority)
```ts
export default defineAppConfig({
  b24ui: {
    input: {
      defaultVariants: { size: 'sm', color: 'air-primary' }
    },
    card: {
      slots: { body: 'p-3' }
    }
  }
})
```

### Level 2: `b24ui` prop (per instance, overrides global)
```vue
<B24Input :b24ui="{ base: 'h-[24px] text-xs' }" />
<B24Card :b24ui="{ root: 'rounded-lg', body: 'p-2' }" />
```

### Level 3: `class` prop (highest priority, root/base only)
```vue
<B24Button class="font-bold rounded-full" />
```

Tailwind Variants uses `tailwind-merge` under the hood, so conflicting classes are resolved automatically.

---

## 7. CSS Custom Properties Summary for Theming

### Component-level (set by style-* classes)
```
--b24ui-background       (component fill)
--b24ui-border-color     (component border)
--b24ui-border-width     (component border width)
--b24ui-color            (component text)
--b24ui-icon-color       (icon default)
```

### Typography semantic
```
--b24ui-typography-legend-color      = base-3 (#828b95)
--b24ui-typography-label-color       = base-2 (#525c69)
--b24ui-typography-description-color = base-3 (#828b95)
```

### Key references
```
--ui-font-family-primary: system font stack
--ui-border-radius-sm: 8px (for sections)
--ui-border-radius-md: 10px (for cards)
--ui-border-radius-2xs: 4px (for fields, buttons)
```

---

## 8. Body Default Styles
```css
body {
  scrollbar-gutter: stable;
  background: var(--air-theme-background);
  font-family: var(--ui-font-family-system);
  color: var(--b24ui-typography-legend-color);
  -webkit-font-smoothing: antialiased;
}
```

---

## 9. For Iframe Placement Context (No Vue/Nuxt)

Since the robot placement UI is server-rendered HTML (not a Vue app), to match b24ui visual style:

### Recommended Approach
1. Use the CSS custom properties directly by importing the token CSS files
2. Or replicate key values in plain CSS
3. Match these specific patterns:
   - **Body font**: `font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Arial, sans-serif`
   - **Body text color**: `#828b95` (legend/description) or `#525c69` (label)
   - **Primary text**: `#333`
   - **Input height**: 28-34px (sm-md)
   - **Input border**: `#edeef0` (base-7), focus: `#0075ff` (accent-main-primary)
   - **Input radius**: 4px (field radius)
   - **Input font**: 13-15px
   - **Card border**: `#edeef0`, radius 10px
   - **Section padding**: 22px (mobile) to 24px (desktop)
   - **Spacing between form fields**: 10px (no description) or 6px (with description)
   - **Label font**: 13px, color #525c69
   - **Description font**: 13px, color #828b95
   - **Error text**: `#ff5752`
   - **Required asterisk**: red `*` after label
   - **Primary button**: bg #0075ff, text white, h-34px, rounded 4px
   - **Secondary button**: outline style, border base-7, text base-2

### Key Hex Values Quick Reference
```
Text primary:     #333333
Text secondary:   #525c69
Text muted:       #828b95
Text placeholder: #c9ccd0
Border default:   #edeef0
Border hover:     #0075ff (primary)
BG white:         #ffffff
BG secondary:     #fbfbfb
BG tertiary:      #f1f4f6
BG page:          #eef2f4
Accent primary:   #0075ff
Accent success:   #1bce7b
Accent alert:     #ff5752
Accent warning:   #faa72c
Accent link:      #0154c8
Divider default:  #f0f0f0
Divider accent:   #e2e2e2
```
