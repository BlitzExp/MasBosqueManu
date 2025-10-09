import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { Palette } from '../../constants/theme';

type Variant = 'primary' | 'attention' | 'outline';

export type BrandButtonProps = {
  label: string;
  onPress?: () => void | Promise<void>;
  disabled?: boolean;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
};

export default function BrandButton({ label, onPress, disabled, variant = 'primary', style }: BrandButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        { opacity: disabled ? 0.6 : pressed ? 0.9 : 1 },
        style,
      ]}
    >
      <Text style={[styles.label, variantTextStyles[variant]]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: Palette.raisin,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    minWidth: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: Palette.hunter,
    borderColor: Palette.hunter,
  },
  attention: {
    backgroundColor: Palette.cocoa,
    borderColor: Palette.cocoa,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: Palette.hunter,
  },
});

const variantTextStyles = StyleSheet.create({
  primary: { color: Palette.ivory },
  attention: { color: Palette.ivory },
  outline: { color: Palette.hunter },
});
