import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton, ScreenContainer } from '../components';
import { useAppState } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import type { CaptureValidationResult } from '../services/imageCaptureValidation';
import { validateCaptureImage } from '../services/imageCaptureValidation';
import { colors, radii, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

export function PreviewScreen({ navigation }: Props) {
  const { pendingImage, setPendingImage } = useAppState();
  const [validation, setValidation] = useState<CaptureValidationResult | null>(null);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    if (!pendingImage) {
      navigation.replace('ImagePicker');
    }
  }, [navigation, pendingImage]);

  useEffect(() => {
    if (!pendingImage?.uri) return;
    let cancelled = false;
    (async () => {
      setValidating(true);
      const result = await validateCaptureImage(pendingImage.uri);
      if (!cancelled) {
        setValidation(result);
        setValidating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pendingImage?.uri]);

  const handleRepeat = useCallback(() => {
    const src = pendingImage?.source;
    setPendingImage(null);
    if (src === 'camera') {
      navigation.replace('FaceCamera');
    } else {
      navigation.replace('ImagePicker');
    }
  }, [navigation, pendingImage?.source, setPendingImage]);

  const handleConfirm = useCallback(() => {
    navigation.navigate('Processing');
  }, [navigation]);

  const handleForceContinue = useCallback(() => {
    Alert.alert(
      'Continuar sin cumplir recomendaciones',
      'La foto no supera las comprobaciones básicas de encuadre e iluminación. El informe de demostración será menos fiable. ¿Seguir de todos modos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, continuar', style: 'destructive', onPress: handleConfirm },
      ],
    );
  }, [handleConfirm]);

  if (!pendingImage) {
    return null;
  }

  const canConfirm = validation?.ok === true;
  const issues = validation?.issues ?? [];

  return (
    <ScreenContainer scroll>
      <Text style={styles.lead}>
        Revisa la vista previa. Validamos de forma aproximada la luz y que el rostro se vea centrado; es orientativo
        para la demo, no sustituye a un sistema clínico.
      </Text>

      <View style={styles.frame}>
        <Image source={{ uri: pendingImage.uri }} style={styles.image} resizeMode="cover" />
      </View>

      <Text style={styles.meta}>
        Origen: {pendingImage.source === 'camera' ? 'Cámara (guía integrada)' : 'Galería'}
      </Text>

      {validating && (
        <View style={styles.statusRow}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.statusText}>Analizando la captura…</Text>
        </View>
      )}

      {!validating && canConfirm && (
        <View style={[styles.banner, styles.bannerOk]}>
          <Text style={styles.bannerTitle}>Listo para continuar</Text>
          <Text style={styles.bannerBody}>La imagen cumple las comprobaciones básicas. Puedes confirmar o repetir si lo prefieres.</Text>
        </View>
      )}

      {!validating && !canConfirm && issues.length > 0 && (
        <View style={[styles.banner, styles.bannerWarn]}>
          <Text style={styles.bannerTitle}>Revisa la captura</Text>
          {issues.map((issue) => (
            <Text key={issue.code} style={styles.issueLine}>
              • {issue.message}
            </Text>
          ))}
          <Text style={styles.repeatHint}>Por favor repite la captura o elige otra imagen.</Text>
        </View>
      )}

      <PrimaryButton
        label="Confirmar y analizar"
        onPress={handleConfirm}
        disabled={validating || !canConfirm}
      />

      <PrimaryButton
        label="Repetir captura"
        variant="secondary"
        style={styles.gapSm}
        onPress={handleRepeat}
        disabled={validating}
      />

      {!validating && !canConfirm && (
        <PrimaryButton
          label="Continuar de todos modos…"
          variant="ghost"
          style={styles.gapSm}
          onPress={handleForceContinue}
        />
      )}

      <PrimaryButton
        label="Volver al inicio de selección"
        variant="ghost"
        style={styles.gapSm}
        onPress={() => {
          setPendingImage(null);
          navigation.replace('ImagePicker');
        }}
        disabled={validating}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lead: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  frame: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    aspectRatio: 3 / 4,
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statusText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  banner: {
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  bannerOk: {
    backgroundColor: 'rgba(47, 143, 107, 0.1)',
    borderColor: colors.success,
  },
  bannerWarn: {
    backgroundColor: 'rgba(193, 122, 45, 0.1)',
    borderColor: colors.warning,
  },
  bannerTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  bannerBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  issueLine: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  repeatHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  gapSm: {
    marginTop: spacing.sm,
  },
});
