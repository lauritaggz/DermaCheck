import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';

/**
 * Pantalla mostrada si alguien abre el bundle en web. El producto es solo móvil (Expo Go / build nativa).
 */
export function MobileOnlyScreen() {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.box}>
        <Text style={styles.title}>DermaCheck</Text>
        <Text style={styles.body}>
          Esta aplicación está pensada solo para móvil (Android e iOS). Instala Expo Go en tu teléfono y ejecuta{' '}
          <Text style={styles.mono}>npx expo start</Text> desde el proyecto, o genera una build nativa.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  box: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: colors.primary,
  },
});
