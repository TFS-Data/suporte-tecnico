---
name: Technical Support Dashboard
colors:
  surface: '#fbf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fbf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f4'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e3'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45474c'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#1e1200'
  on-tertiary: '#ffffff'
  tertiary-container: '#35260c'
  on-tertiary-container: '#a38c6a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#fadfb8'
  tertiary-fixed-dim: '#ddc39d'
  on-tertiary-fixed: '#271902'
  on-tertiary-fixed-variant: '#564427'
  background: '#fbf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e3'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
  data-tabular:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style

The design system is anchored in a **Corporate/Modern** aesthetic, prioritizing precision, reliability, and executive clarity. It is designed for high-density technical environments where quick scanning and error-free navigation are critical. 

The personality is authoritative yet accessible, utilizing a "Productive Minimalism" approach. This means stripping away unnecessary ornamentation to let data and status indicators take center stage. The user should feel a sense of organized control through a structured interface that balances high information density with enough breathing room to prevent cognitive overload. The emotional response is one of trust and operational efficiency.

## Colors

The palette is strategically divided into structural, functional, and semantic layers.

- **Structural:** Navy Blue (#1e293b) is used for primary navigation and headers to establish hierarchy and stability. Light Gray (#f8fafc) serves as the canvas for all workspaces to reduce eye strain.
- **Semantic (Status):** Accents are strictly reserved for categorization and status. 
  - **TI (Blue):** Technical infrastructure and software.
  - **Elétrica (Yellow):** Power systems and lighting.
  - **Civil (Green):** Maintenance and structure.
  - **Segurança (Red):** Critical alerts and access control.
  - **Telecom (Purple):** Network and connectivity.
- **Interaction:** Use a medium blue for primary actions and subtle grays for borders to maintain a clean, "un-boxed" look.

## Typography

The typography utilizes **Inter** to leverage its exceptional legibility in data-heavy interfaces. 

For the Brazilian Portuguese context, special attention is paid to character spacing to accommodate longer word strings (e.g., "Configurações"). 
- **Hierarchy:** Use bold weights for headers to contrast against the light background. 
- **Data:** For tables and metrics, enable tabular figures (monospaced numbers) to ensure columns of numbers align perfectly for easy comparison.
- **Labels:** Use uppercase for small labels to differentiate them from body content without increasing size.

## Layout & Spacing

This design system employs a **Fluid Grid** with a 12-column system for desktop views. 

- **Grid:** On desktop, use 24px gutters. On mobile, transition to a single-column layout with 16px side margins.
- **Rhythm:** Spacing follows a strict 4px base unit. 16px is the standard padding for cards and containers, while 24px is used for section vertical separation.
- **Density:** The layout supports a "Comfortable" density by default but should allow for a "Compact" mode where padding is reduced to 8px for data-heavy administrative tables.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** supplemented by **Ambient Shadows**.

1.  **Level 0 (Base):** Light Gray (#f8fafc) - The main background.
2.  **Level 1 (Cards):** Pure White (#ffffff) - Used for data containers and table surfaces. These feature a very soft, diffused shadow (0px 1px 3px rgba(0,0,0,0.05)) to separate them from the background.
3.  **Level 2 (Modals/Overlays):** Pure White with a more pronounced shadow (0px 10px 15px rgba(0,0,0,0.1)) to indicate focus and interaction priority.
4.  **Separators:** 1px borders in #e2e8f0 are used instead of shadows to divide sections within the same container.

## Shapes

The design system uses a **Rounded** shape language to soften the technical nature of the data.

- **Cards and Containers:** 0.5rem (8px) corner radius.
- **Buttons and Inputs:** 0.5rem (8px) for a consistent, modern feel.
- **Status Badges (Chips):** Full-pill radius (999px) to distinguish them clearly from interactive buttons.
- **Selection Indicators:** Use a 4px vertical bar on the left side of active list items or navigation links to provide a clear state indicator without relying solely on color.

## Components

- **Buttons:** Primary buttons use the Navy Blue (#1e293b) with white text. Secondary buttons use a light gray ghost style with the primary color for text.
- **Status Badges (Etiquetas):** These are the core of the dashboard. Use a subtle background (10% opacity of the accent color) with a high-contrast text version of the same color for maximum readability (e.g., Light Red background with Deep Red text for "Segurança").
- **Data Tables (Tabelas):** Flat design with no vertical borders. Use 1px horizontal dividers. The header row should have a light gray background (#f1f5f9) and bold, small-caps text.
- **Input Fields:** Outlined style with #e2e8f0 borders. On focus, the border shifts to the Blue accent (#3b82f6) with a subtle outer glow.
- **Cards (Cards de Resumo):** Top-level metrics cards should include a small trend icon (up/down) and the categorical accent color as a top-border strip (3px height) to associate the metric with its department immediately.
- **Language:** All microcopy must be in Portuguese (Brazil). Use "Pesquisar" for search and "Filtrar" for filtering.