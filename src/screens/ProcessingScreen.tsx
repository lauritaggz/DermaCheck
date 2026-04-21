import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components';
import { useAppState } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { analysisService } from '../services';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Processing'>;

export function ProcessingScreen({ navigation }: Props) {
  const { pendingImage, user, setLastAnalysis } = useAppState();
  const [status, setStatus] = useState('Preparando imagen…');
  const [failed, setFailed] = useState<string | null>(null);
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
      setStatus('Enviando imagen al servidor…');
      const statusTimer = setTimeout(() => {
        if (alive) setStatus('Ejecutando modelo de visión en el servidor…');
      }, 1200);
      try {
        const result = await analysisService.analyzeImage({
          image: pendingImage,
          userId: user.id,
        });
        clearTimeout(statusTimer);
        if (!alive) return;
        setLastAnalysis(result);
        setStatus('Informe completado');
        navigation.replace('Results');
      } catch (e) {
        clearTimeout(statusTimer);
        if (!alive) return;
        const msg = e instanceof Error ? e.message : 'No se pudo completar el análisis.';
        setFailed(msg);
        setStatus('');
      }
    })();

    return () => {
      alive = false;
    };
  }, [navigation, pendingImage, setLastAnalysis, user]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      {!failed ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      ) : null}
      <Text style={styles.title}>{failed ? 'No se pudo analizar' : 'Analizando su piel'}</Text>
      {failed ? (
        <ScrollView
          style={styles.errorScroll}
          contentContainerStyle={styles.errorScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.sub, styles.errorText]}>{failed}</Text>
          <PrimaryButton
            label="Volver al inicio"
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
            style={styles.retryBtn}
          />
        </ScrollView>
      ) : (
        <Text style={styles.sub}>{status}</Text>
      )}
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
  errorText: {
    color: colors.text,
  },
  retryBtn: {
    marginTop: spacing.lg,
  },
  errorScroll: {
    flexGrow: 0,
    maxHeight: '70%',
    width: '100%',
  },
  errorScrollContent: {
    paddingBottom: spacing.md,
  },
});
