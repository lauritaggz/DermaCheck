import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, radii, spacing, typography } from '../theme';

type Variant = 'error' | 'success' | 'neutral';

type Props = {
  message: string;
  variant?: Variant;
  style?: ViewStyle;
};

export function FormMessage({ message, variant = 'error', style }: Props) {
  const palette =
    variant === 'success'
      ? { bg: '#E8F5EF', border: colors.success, text: colors.text }
      : variant === 'neutral'
        ? { bg: colors.surfaceMuted, border: colors.border, text: colors.textSecondary }
        : { bg: '#FDEDEE', border: colors.error, text: colors.text };

  return (
    <View style={[styles.box, { backgroundColor: palette.bg, borderColor: palette.border }, style]}>
      <Text style={[styles.text, { color: palette.text }]} accessibilityRole="alert">
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  text: {
    ...typography.bodySmall,
    lineHeight: 20,
  },
});
