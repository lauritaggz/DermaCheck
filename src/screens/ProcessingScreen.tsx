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

export function ProcessingScreen({ navigation, route }: Props) {
  const { pendingImage, user, setLastAnalysis } = useAppState();
  const [status, setStatus] = useState('Preparando imagen…');
  const ran = useRef(false);

  const { selectedConditionIds } = route.params;

  useEffect(() => {
    if (!pendingImage || !user) {
      navigation.replace('Home');
      return;
    }
    if (ran.current) return;
    ran.current = true;

    let alive = true;
    (async () => {
      setStatus('Analizando patrones dermatológicos…');
      try {
        const result = await analysisService.analyzeImage({
          image: pendingImage,
          userId: user.id,
          selectedConditionIds,
        });
        if (!alive) return;
        setLastAnalysis(result);
        setStatus('Informe completado');
        navigation.replace('Results');
      } catch {
        if (!alive) return;
        setStatus('Error en el procesamiento del análisis.');
      }
    })();

    return () => {
      alive = false;
    };
  }, [navigation, pendingImage, setLastAnalysis, user, selectedConditionIds]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      <Text style={styles.title}>Analizando su piel</Text>
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
