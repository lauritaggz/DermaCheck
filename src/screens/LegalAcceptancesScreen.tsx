import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card, DisclaimerBanner, ScreenContainer } from '../components';
import { getApiBaseUrl } from '../config/api';
import { useAppState } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { consentService } from '../services';
import { colors, spacing, typography } from '../theme';
import type { DocumentAcceptanceRecord } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'LegalAcceptances'>;

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function LegalAcceptancesScreen({ navigation }: Props) {
  const { user, consent } = useAppState();
  const [remoteRows, setRemoteRows] = useState<DocumentAcceptanceRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      navigation.replace('Welcome');
      return;
    }
    setError(null);
    if (!getApiBaseUrl()) {
      setRemoteRows(null);
      return;
    }
    setLoading(true);
    try {
      const rows = await consentService.fetchUserAcceptances(user.id);
      setRemoteRows(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el historial.');
      setRemoteRows([]);
    } finally {
      setLoading(false);
    }
  }, [navigation, user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const displayList =
    remoteRows !== null && remoteRows.length > 0
      ? remoteRows
      : consent.accepted && consent.acceptances?.length
        ? consent.acceptances
        : [];

  if (!user) {
    return null;
  }

  return (
    <ScreenContainer scroll={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        showsVerticalScrollIndicator={false}
      >
        <DisclaimerBanner text="Listado orientativo. En producción el contenido legal completo lo facilitaría el responsable del tratamiento." />
        <Text style={styles.title}>Documentos aceptados</Text>
        <Text style={styles.lead}>
          Aquí ves qué documentos quedaron registrados para tu usuario y en qué momento (hora del servidor cuando hay API;
          en modo solo-app, los datos salen de esta sesión).
        </Text>

        {!getApiBaseUrl() ? (
          <Text style={styles.offline}>
            No hay URL de API configurada (EXPO_PUBLIC_API_BASE_URL). Configúrala para persistir en MySQL y refrescar desde
            el servidor.
          </Text>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading && displayList.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : null}

        {displayList.length === 0 && !loading ? (
          <Card>
            <Text style={styles.empty}>
              {consent.accepted
                ? 'No hay detalle por documento en esta sesión. Si aceptaste antes de esta versión, puede faltar el desglose; con el API activo podrás ver el historial en MySQL.'
                : 'No hay aceptaciones registradas todavía.'}
            </Text>
          </Card>
        ) : null}

        {displayList.map((row, idx) => (
          <Card key={`${row.documentSlug}-${row.acceptedAt}-${idx}`} style={styles.card}>
            <Text style={styles.docTitle}>{row.title}</Text>
            <Text style={styles.meta}>Identificador: {row.documentSlug}</Text>
            <Text style={styles.meta}>Versión aceptada: {row.versionAccepted}</Text>
            <Text style={styles.meta}>Estado: {row.status}</Text>
            <Text style={styles.when}>Fecha y hora: {formatWhen(row.acceptedAt)}</Text>
          </Card>
        ))}
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
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  lead: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  offline: {
    ...typography.caption,
    color: colors.warning,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    marginBottom: spacing.md,
  },
  center: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  card: {
    marginBottom: spacing.md,
  },
  docTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  when: {
    ...typography.bodySmall,
    color: colors.text,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
