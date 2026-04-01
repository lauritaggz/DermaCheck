import { ScrollView, StyleSheet, View, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

type Props = ViewProps & {
  scroll?: boolean;
  children: React.ReactNode;
  backgroundColor?: string;
};

export function ScreenContainer({ scroll, children, style, backgroundColor, ...rest }: Props) {
  const containerStyle = [
    styles.safe,
    backgroundColor ? { backgroundColor } : null,
  ];

  if (scroll) {
    return (
      <SafeAreaView style={containerStyle} edges={['left', 'right', 'bottom']}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, style]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...rest}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[containerStyle, styles.flex, style]} edges={['left', 'right', 'bottom']} {...rest}>
      <View style={styles.flex}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
