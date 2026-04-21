import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckboxRow, DisclaimerBanner, FormMessage, PrimaryButton, ScreenContainer } from '../components';
import { CONSENT_SUMMARY, PRIVACY_SUMMARY } from '../constants/disclaimers';
import { LEGAL_DOCUMENTS } from '../constants/legalDocuments';
import { useAppState } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { consentService } from '../services';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Consent'>;

export function ConsentScreen({ navigation }: Props) {
  const { setConsent, consent, user } = useAppState();
  const [consentRead, setConsentRead] = useState(false);
  const [privacyRead, setPrivacyRead] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigation.replace('Welcome');
    }
  }, [navigation, user]);

  useEffect(() => {
    if (consent.accepted) {
      navigation.replace('Home');
    }
  }, [consent.accepted, navigation]);

  const bothChecked = consentRead && privacyRead;

  async function onContinue() {
    if (!user) return;
    if (!bothChecked) {
      setFormError('Marca ambas casillas para confirmar que leíste el consentimiento y la política de privacidad.');
      return;
    }
    setFormError(null);
    setLoading(true);
    try {
      const next = await consentService.acceptAllRequiredDocuments(user.id);
      setConsent(next);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'No se pudo registrar la aceptación. Revisa la conexión o el servidor.');
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <ScreenContainer scroll>
      <DisclaimerBanner text="Los análisis de DermaCheck son preliminares y no reemplazan el criterio de un profesional de la salud." />
      <Text style={styles.title}>Consentimiento y privacidad</Text>
      <Text style={styles.meta}>
        Documentos en versión {LEGAL_DOCUMENTS.consent_informed.version} · registro en servidor
      </Text>

      {formError ? <FormMessage message={formError} variant="error" /> : null}

      <Text style={styles.sectionTitle}>{LEGAL_DOCUMENTS.consent_informed.shortTitle}</Text>
      <Text style={styles.block}>{CONSENT_SUMMARY}</Text>

      <Text style={styles.sectionTitle}>{LEGAL_DOCUMENTS.privacy_policy.shortTitle}</Text>
      <Text style={styles.block}>{PRIVACY_SUMMARY}</Text>

      <View style={styles.checkWrap}>
        <CheckboxRow
          checked={consentRead}
          onToggle={() => {
            setConsentRead((v) => !v);
            setFormError(null);
          }}
          label={`He leído y acepto el ${LEGAL_DOCUMENTS.consent_informed.shortTitle.toLowerCase()} (versión ${LEGAL_DOCUMENTS.consent_informed.version}).`}
        />
        <View style={styles.checkGap} />
        <CheckboxRow
          checked={privacyRead}
          onToggle={() => {
            setPrivacyRead((v) => !v);
            setFormError(null);
          }}
          label={`He leído y acepto la ${LEGAL_DOCUMENTS.privacy_policy.shortTitle.toLowerCase()} (versión ${LEGAL_DOCUMENTS.privacy_policy.version}).`}
        />
      </View>

      <PrimaryButton label="Registrar aceptación y continuar" onPress={onContinue} loading={loading} disabled={!bothChecked || loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  block: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  checkWrap: {
    marginVertical: spacing.lg,
  },
  checkGap: {
    height: spacing.md,
  },
});
