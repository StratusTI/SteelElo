import { StickyColor } from "../@types/sticky";

const VALID_STICKY_COLORS: StickyColor[] = [
  'gray',
  'peach',
  'pink',
  'orange',
  'green',
  'lightblue',
  'darkblue',
  'purple',
];

/**
 * Validates if a string is a valid sticky color
 */
export function validateStickyColor(color: string): color is StickyColor {
  return VALID_STICKY_COLORS.includes(color as StickyColor);
}
