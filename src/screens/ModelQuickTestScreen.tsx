import * as ImagePicker from 'expo-image-picker';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PrimaryButton, ScreenContainer } from '../components';
import { quickInferenceOnImageUri } from '../services/analysisService';
import type { FaceDetection } from '../types';
import { colors, spacing, typography } from '../theme';

/** Etiqueta corta en español a partir del nombre de clase del entrenamiento YOLO. */
function formatClassLabel(raw: string): string {
  const token = raw.split(/[\s-]/u)[0]?.toLowerCase() ?? raw.toLowerCase();
  const map: Record<string, string> = {
    acne: 'Acné',
    eczema: 'Eczema',
    manchas: 'Manchas',
    puntos: 'Puntos negros',
    resequedad: 'Resequedad',
    rosacea: 'Rosácea',
    wrinkle: 'Líneas / arrugas',
  };
  if (token === 'puntos') return map.puntos;
  return map[token] ?? raw.split(/\s+/u)[0] ?? raw;
}

/** Una fila por clase con la mayor confianza entre cajas de esa clase. */
function aggregateByClass(detections: FaceDetection[]): { label: string; confidence: number }[] {
  const best = new Map<string, number>();
  for (const d of detections) {
    const key = d.class_name.trim();
    const prev = best.get(key) ?? 0;
    if (d.confidence > prev) best.set(key, d.confidence);
  }
  return [...best.entries()]
    .map(([className, confidence]) => ({
      label: formatClassLabel(className),
      confidence,
    }))
    .sort((a, b) => b.confidence - a.confidence);
}

export function ModelQuickTestScreen() {
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detections, setDetections] = useState<FaceDetection[]>([]);

  const summary = useMemo(() => aggregateByClass(detections), [detections]);

  const pickAndRun = useCallback(async () => {
    setError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permisos', 'Se necesita acceso a la galería para elegir una imagen.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (result.canceled || !result.assets[0]?.uri) return;
    const nextUri = result.assets[0].uri;
    setUri(nextUri);
    setLoading(true);
    setDetections([]);
    try {
      const dets = await quickInferenceOnImageUri(nextUri, 0.25);
      setDetections(dets);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al ejecutar el modelo.');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ScreenContainer scroll>
      <Text style={styles.lead}>
        Herramienta para desarrollo: sube una imagen y el servidor ejecuta el modelo entrenado (best.pt). No guarda
        usuario ni historial; solo lista las clases detectadas.
      </Text>
      <PrimaryButton label={loading ? 'Procesando…' : 'Elegir imagen y analizar'} onPress={pickAndRun} disabled={loading} />
      {uri ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri }} style={styles.preview} resizeMode="cover" />
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && detections.length === 0 && uri && !error ? (
        <Text style={styles.empty}>No se detectaron afecciones por encima del umbral de confianza (0,25).</Text>
      ) : null}
      {summary.length > 0 ? (
        <ScrollView style={styles.list} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Afecciones presentes en la imagen</Text>
          {summary.map((row) => (
            <View key={row.label} style={styles.row}>
              <Text style={styles.className}>{row.label}</Text>
              <Text style={styles.conf}>{Math.round(row.confidence * 100)}%</Text>
            </View>
          ))}
        </ScrollView>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lead: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  previewWrap: {
    marginTop: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    aspectRatio: 3 / 4,
    maxHeight: 280,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  error: {
    ...typography.bodySmall,
    color: colors.primaryDark,
    marginTop: spacing.md,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  list: {
    marginTop: spacing.lg,
    maxHeight: 320,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  className: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    paddingRight: spacing.md,
  },
  conf: {
    ...typography.subtitle,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
});
