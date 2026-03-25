import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormMessage, PrimaryButton, ScreenContainer, TextField } from '../components';
import { useAppState } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { authService } from '../services';
import { colors, spacing, typography } from '../theme';
import type { LoginFieldKey } from '../utils/validation';
import { validateLoginFields } from '../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const emptyFieldErrors: Partial<Record<LoginFieldKey, string>> = {};

export function LoginScreen({ navigation }: Props) {
  const { setUser, consent } = useAppState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<LoginFieldKey, string>>>(emptyFieldErrors);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearFieldError = useCallback((key: LoginFieldKey) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setFormError(null);
  }, []);

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
    },
    [clearFieldError],
  );

  async function onSubmit() {
    const errs = validateLoginFields(email, password);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setFormError(null);
      return;
    }
    setFieldErrors(emptyFieldErrors);
    setFormError(null);
    setLoading(true);
    const result = await authService.login({ email, password });
    setLoading(false);
    if ('error' in result) {
      setFormError(result.error);
      return;
    }
    setUser(result.user);
    navigation.reset({
      index: 0,
      routes: [{ name: consent.accepted ? 'Home' : 'Consent' }],
    });
  }

  return (
    <ScreenContainer scroll>
      <Text style={styles.lead}>
        Inicia sesión con la cuenta que creaste en el registro (demo local en este dispositivo).
      </Text>
      {formError ? <FormMessage message={formError} variant="error" /> : null}
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
        autoComplete="password"
        error={fieldErrors.password}
        editable={!loading}
      />
      <PrimaryButton
        label="Entrar"
        onPress={onSubmit}
        loading={loading}
        disabled={loading}
      />
      {loading ? (
        <View style={styles.footerRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.footerNote}>Comprobando credenciales…</Text>
        </View>
      ) : (
        <Text style={styles.hint}>
          Regístrate primero si es la primera vez. Los datos se guardan solo en este dispositivo.
        </Text>
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
