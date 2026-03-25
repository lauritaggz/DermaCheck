import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckboxRow, DisclaimerBanner, PrimaryButton, ScreenContainer } from '../components';
import { CONSENT_SUMMARY } from '../constants/disclaimers';
import { useAppState } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { consentService } from '../services';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Consent'>;

export function ConsentScreen({ navigation }: Props) {
  const { setConsent, consent } = useAppState();
  const [readOk, setReadOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onContinue() {
    if (!readOk) {
      Alert.alert('Consentimiento', 'Confirma que has leído y aceptas la información para continuar.');
      return;
    }
    setLoading(true);
    const next = await consentService.acceptConsent(consent.policyVersion);
    setConsent(next);
    setLoading(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }

  return (
    <ScreenContainer scroll>
      <DisclaimerBanner text="Los análisis de DermaCheck son preliminares y no reemplazan el criterio de un profesional de la salud." />
      <Text style={styles.title}>Información y privacidad</Text>
      <Text style={styles.block}>{CONSENT_SUMMARY}</Text>
      <View style={styles.checkWrap}>
        <CheckboxRow
          checked={readOk}
          onToggle={() => setReadOk((v) => !v)}
          label="He leído la información esencial y acepto continuar con esta demostración bajo estos términos."
        />
      </View>
      <PrimaryButton label="Continuar" onPress={onContinue} loading={loading} disabled={!readOk} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  block: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  checkWrap: {
    marginVertical: spacing.lg,
  },
});
