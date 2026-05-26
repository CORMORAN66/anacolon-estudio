/**
 * NOTE: This project uses Tailwind v4, which ignores this file.
 * All design tokens live in src/app/globals.css under @theme inline.
 * This file is kept for IDE reference only.
 *
 * Brand tokens (accessible as Tailwind utilities):
 *   text-gold / bg-gold      → #C9A96E
 *   text-ink / bg-ink        → #1A1A1A
 *   text-muted               → #888888
 *   bg-off-white             → #F9F7F4
 *   font-heading             → Cormorant Garamond
 *   font-body                → Inter
 */
import type { Config } from 'tailwindcss'
const config: Config = { content: ['./src/**/*.{ts,tsx}'] }
export default config
