/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Brand palette from design
export const Palette = {
  ivory: '#F5F9E9', // background
  cocoa: '#D16014', // important / attention
  hunter: '#345830', // buttons / icons
  raisin: '#2D232E', // contrast / dark bg
  asparagus: '#88AB6A', // interactive / movement
} as const;

const tintColorLight = Palette.hunter;
const tintColorDark = Palette.asparagus;

export const Colors = {
  light: {
    text: Palette.raisin,
    background: Palette.ivory,
    tint: tintColorLight,
    icon: Palette.hunter,
    tabIconDefault: '#6b8a75',
    tabIconSelected: tintColorLight,
    attention: Palette.cocoa,
    interactive: Palette.asparagus,
  },
  dark: {
    text: Palette.ivory,
    background: Palette.raisin,
    tint: tintColorDark,
    icon: Palette.asparagus,
    tabIconDefault: '#7aa36c',
    tabIconSelected: tintColorDark,
    attention: Palette.cocoa,
    interactive: Palette.asparagus,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
