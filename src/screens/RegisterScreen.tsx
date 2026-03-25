import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormMessage, PrimaryButton, ScreenContainer, TextField } from '../components';
import { useAppState } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { LEGAL_DOC_VERSION } from '../constants/legalDocuments';
import { authService } from '../services';
import { colors, spacing, typography } from '../theme';
import type { RegisterFieldKey } from '../utils/validation';
import { validateRegisterFields } from '../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const emptyFieldErrors: Partial<Record<RegisterFieldKey, string>> = {};

export function RegisterScreen({ navigation }: Props) {
  const { setUser, setConsent } = useAppState();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<RegisterFieldKey, string>>>(emptyFieldErrors);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearFieldError = useCallback((key: RegisterFieldKey) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setFormError(null);
  }, []);

  const onChangeName = useCallback(
    (t: string) => {
      setName(t);
      clearFieldError('name');
    },
    [clearFieldError],
  );

  const onChangeEmail = useCallback(
    (t: string) => {
      setEmail(t);
      clearFieldError('email');
    },
    [clearFieldError],
  );

  const onChangePassword = useCallback(
    (t: string) => {
      setPassword(t);
      clearFieldError('password');
      clearFieldError('confirmPassword');
    },
    [clearFieldError],
  );

  const onChangeConfirm = useCallback(
    (t: string) => {
      setConfirmPassword(t);
      clearFieldError('confirmPassword');
    },
    [clearFieldError],
  );

  async function onSubmit() {
    const errs = validateRegisterFields(name, email, password, confirmPassword);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setFormError(null);
      return;
    }
    setFieldErrors(emptyFieldErrors);
    setFormError(null);
    setLoading(true);
    const result = await authService.register({ name, email, password });
    setLoading(false);
    if ('error' in result) {
      setFormError(result.error);
      return;
    }
    setUser(result.user);
    setConsent({ accepted: false, acceptedAt: null, policyVersion: LEGAL_DOC_VERSION });
    navigation.reset({
      index: 0,
      routes: [{ name: 'Consent' }],
    });
  }

  return (
    <ScreenContainer scroll>
      <Text style={styles.lead}>Crea tu cuenta de demostración. Los datos se guardan solo en este dispositivo.</Text>
      {formError ? <FormMessage message={formError} variant="error" /> : null}
      <TextField
        label="Nombre"
        value={name}
        onChangeText={onChangeName}
        autoComplete="name"
        error={fieldErrors.name}
        editable={!loading}
      />
      <TextField
        label="Correo electrónico"
        value={email}
        onChangeText={onChangeEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        error={fieldErrors.email}
        editable={!loading}
      />
      <TextField
        label="Contraseña"
        value={password}
        onChangeText={onChangePassword}
        secureTextEntry
        autoComplete="password-new"
        error={fieldErrors.password}
        editable={!loading}
      />
      <TextField
        label="Confirmar contraseña"
        value={confirmPassword}
        onChangeText={onChangeConfirm}
        secureTextEntry
        autoComplete="password-new"
        error={fieldErrors.confirmPassword}
        editable={!loading}
      />
      <PrimaryButton
        label="Registrarme"
        onPress={onSubmit}
        loading={loading}
        disabled={loading}
      />
      {loading ? (
        <View style={styles.footerRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.footerNote}>Creando tu cuenta…</Text>
        </View>
      ) : (
        <Text style={styles.hint}>Mínimo 6 caracteres en la contraseña. Sin marcas ni diagnósticos: solo demo.</Text>
      )}
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
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  footerNote: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
