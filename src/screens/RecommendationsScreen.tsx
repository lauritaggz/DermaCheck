import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card, DisclaimerBanner, PrimaryButton, ScreenContainer } from '../components';
import { useAppState } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';
import { recommendationCategoryLabel } from '../utils/recommendationCategoryLabel';
import { severityLabel } from '../utils/severityLabels';
import { skinTypeLabel } from '../utils/skinTypeLabel';

type Props = NativeStackScreenProps<RootStackParamList, 'Recommendations'>;

function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

export function RecommendationsScreen({ navigation }: Props) {
  const { lastAnalysis } = useAppState();

  useEffect(() => {
    if (!lastAnalysis) {
      navigation.replace('Home');
    }
  }, [lastAnalysis, navigation]);

  if (!lastAnalysis) {
    return null;
  }

  const items = lastAnalysis.recommendations;
  const findingsLine = lastAnalysis.conditions
    .map((c) => `${c.label} (${severityLabel(c.severity)})`)
    .join(' · ');

  return (
    <ScreenContainer scroll={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleSection}>
          <Text style={styles.title}>Plan de Cuidados Personalizado</Text>
          <Text style={styles.lead}>
            Tratamientos y productos recomendados según su perfil dermatológico y los hallazgos
            descritos a continuación.
          </Text>
        </View>
        <Card style={styles.contextCard}>
          <Text style={styles.contextLabel}>Análisis de Hallazgos</Text>
          <Text style={styles.contextBody}>{findingsLine}</Text>
        </Card>
        {items.map((r) => (
          <Card key={r.id} style={styles.card}>
            <Text style={styles.cat}>{recommendationCategoryLabel(r.category)}</Text>
            <Text style={styles.cardTitle}>{r.title}</Text>
            <Text style={styles.body}>{r.body}</Text>
            {r.suggestedIngredients.length > 0 ? (
              <View style={styles.block}>
                <Text style={styles.blockTitle}>Ingredientes de referencia (orientativos)</Text>
                <View style={styles.chipRow}>
                  {r.suggestedIngredients.map((ing) => (
                    <Chip key={ing} label={ing} />
                  ))}
                </View>
              </View>
            ) : null}
            {r.suggestedProductTypes.length > 0 ? (
              <View style={styles.block}>
                <Text style={styles.blockTitle}>Tipos de producto sugeridos</Text>
                <View style={styles.chipRow}>
                  {r.suggestedProductTypes.map((p) => (
                    <Chip key={p} label={p} />
                  ))}
                </View>
              </View>
            ) : null}
          </Card>
        ))}
        <Text style={styles.footerNote}>
          Comprueba siempre tolerancia en una pequeña zona antes de extender un producto nuevo. Ante duda o molestias,
          suspende su uso y consulta con un profesional.
        </Text>
        <PrimaryButton label="Nuevo análisis" onPress={() => navigation.navigate('ImagePicker')} />
        <PrimaryButton
          label="Volver al inicio"
          variant="secondary"
          style={styles.secondary}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  titleSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.display,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  lead: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  leadStrong: {
    color: colors.text,
    fontWeight: '600',
  },
  contextCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  contextLabel: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  contextBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  card: {
    marginBottom: spacing.md,
  },
  cat: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  cardTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  block: {
    marginTop: spacing.sm,
  },
  blockTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    ...typography.caption,
    color: colors.text,
  },
  footerNote: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  secondary: {
    marginTop: spacing.sm,
  },
});
