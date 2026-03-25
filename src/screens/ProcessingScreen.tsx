import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DisclaimerBanner } from '../components';
import { useAppState } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { analysisService } from '../services';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Processing'>;

export function ProcessingScreen({ navigation }: Props) {
  const { pendingImage, user, setLastAnalysis } = useAppState();
  const [status, setStatus] = useState('Preparando imagen…');
  const ran = useRef(false);

  useEffect(() => {
    if (!pendingImage || !user) {
      navigation.replace('Home');
      return;
    }
    if (ran.current) return;
    ran.current = true;

    let alive = true;
    (async () => {
      setStatus('Analizando patrones visibles (simulado)…');
      try {
        const result = await analysisService.analyzeImage({
          image: pendingImage,
          userId: user.id,
        });
        if (!alive) return;
        setLastAnalysis(result);
        setStatus('Informe listo');
        navigation.replace('Results');
      } catch {
        if (!alive) return;
        setStatus('No se pudo completar el análisis de demostración.');
      }
    })();

    return () => {
      alive = false;
    };
  }, [navigation, pendingImage, setLastAnalysis, user]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <DisclaimerBanner text="Procesamiento simulado para la demo; en producción se conectará a un servicio seguro de IA." />
      <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      <Text style={styles.title}>Analizando tu piel</Text>
      <Text style={styles.sub}>{status}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    justifyContent: 'center',
  },
  spinner: {
    marginBottom: spacing.lg,
    alignSelf: 'center',
  },
  title: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  sub: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
