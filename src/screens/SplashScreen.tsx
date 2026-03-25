import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';

export type SplashScreenProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: SplashScreenProps) {
  useEffect(() => {
    const id = setTimeout(() => {
      navigation.replace('Welcome');
    }, 1700);
    return () => clearTimeout(id);
  }, [navigation]);

  return (
    <View style={styles.root}>
      <Text style={styles.logo}>DermaCheck</Text>
      <Text style={styles.tagline}>Análisis cutáneo asistido · Demo académica</Text>
      <ActivityIndicator style={styles.loader} color={colors.primary} size="large" />
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
});
