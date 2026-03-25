import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme';

type Props = {
  text: string;
};

export function DisclaimerBanner({ text }: Props) {
  return (
    <View style={styles.box} accessibilityRole="alert">
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surfaceMuted,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: radii.sm,
  },
  text: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
