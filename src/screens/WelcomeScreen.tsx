import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton, ScreenContainer } from '../components';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <ScreenContainer scroll style={[styles.scroll, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.hero}>
        <Text style={styles.title}>Tu piel, con contexto</Text>
        <Text style={styles.body}>
          DermaCheck te guía en un análisis preliminar del rostro para entender mejor el estado visible de tu piel.
          En esta versión los resultados son simulados y no sustituyen una consulta médica.
        </Text>
      </View>
      <PrimaryButton label="Iniciar sesión" onPress={() => navigation.navigate('Login')} />
      <PrimaryButton
        label="Crear cuenta"
        variant="secondary"
        style={styles.secondaryBtn}
        onPress={() => navigation.navigate('Register')}
      />
      <Text style={styles.footnote}>Proyecto académico · Sprint 1</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: spacing.xxl,
  },
  hero: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.display,
    color: colors.text,
    marginBottom: spacing.md,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  secondaryBtn: {
    marginTop: spacing.sm,
  },
  footnote: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
