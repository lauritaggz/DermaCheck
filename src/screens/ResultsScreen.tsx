import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card, DisclaimerBanner, PrimaryButton, ScreenContainer } from '../components';
import { useAppState } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';
import { severityLabel } from '../utils/severityLabels';
import { skinTypeLabel } from '../utils/skinTypeLabel';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function ResultsScreen({ navigation }: Props) {
  const { lastAnalysis } = useAppState();

  useEffect(() => {
    if (!lastAnalysis) {
      navigation.replace('Home');
    }
  }, [lastAnalysis, navigation]);

  if (!lastAnalysis) {
    return null;
  }

  return (
    <ScreenContainer scroll={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleSection}>
          <Text style={styles.title}>Informe de Análisis Facial</Text>
          <Text style={styles.date}>Análisis del {formatDate(lastAnalysis.analyzedAt)}</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Tipo de piel</Text>
          <Text style={styles.skinTypeValue}>{skinTypeLabel(lastAnalysis.skinType)}</Text>
          <Text style={styles.body}>{lastAnalysis.skinTypeRationale}</Text>
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>Severidad global de hallazgos</Text>
          <Text style={styles.body}>{lastAnalysis.severityOverview}</Text>
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>Resumen del Análisis</Text>
          <Text style={styles.body}>{lastAnalysis.overallSummary}</Text>
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>Estado general de la piel</Text>
          <Text style={styles.body}>{lastAnalysis.generalSkinState}</Text>
        </Card>
        <Text style={styles.sectionTitle}>Hallazgos detectados</Text>
        {lastAnalysis.conditions.map((c) => (
          <Card key={c.id} style={styles.conditionCard}>
            <View style={styles.row}>
              <Text style={styles.conditionTitle}>{c.label}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{severityLabel(c.severity)}</Text>
              </View>
            </View>
            <Text style={styles.desc}>{c.description}</Text>
            {c.analysisNote ? <Text style={styles.note}>{c.analysisNote}</Text> : null}
          </Card>
        ))}
        <PrimaryButton
          label="Ver recomendaciones"
          onPress={() => navigation.navigate('Recommendations')}
        />
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
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.display,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  skinTypeValue: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.md,
  },
  conditionCard: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  conditionTitle: {
    ...typography.subtitle,
    color: colors.text,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  desc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  note: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  secondary: {
    marginTop: spacing.sm,
  },
});
