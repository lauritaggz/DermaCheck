import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppState } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';

export type SplashScreenProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: SplashScreenProps) {
  const { hydrated, user, consent } = useAppState();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hydrated) return;

    if (user) {
      navigation.replace(consent.accepted ? 'Home' : 'Consent');
      return;
    }

    timerRef.current = setTimeout(() => {
      navigation.replace('Welcome');
    }, 1600);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [hydrated, user, consent.accepted, navigation]);

  return (
    <View style={styles.root}>
      <Text style={styles.logo}>DermaCheck</Text>
      <Text style={styles.tagline}>Análisis cutáneo asistido · Demo académica</Text>
      <ActivityIndicator style={styles.loader} color={colors.primary} size="large" />
      {!hydrated ? (
        <Text style={styles.hint}>Cargando sesión…</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  logo: {
    ...typography.display,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  loader: {
    marginTop: spacing.md,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
