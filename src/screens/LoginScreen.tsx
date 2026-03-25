import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton, ScreenContainer, TextField } from '../components';
import { useAppState } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { authService } from '../services';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { setUser, consent } = useAppState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    const result = await authService.login({ email, password });
    setLoading(false);
    if ('error' in result) {
      Alert.alert('No se pudo iniciar sesión', result.error);
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
        Accede para guardar tu sesión de demostración y recorrer el flujo completo.
      </Text>
      <TextField
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <TextField
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
      />
      <PrimaryButton label="Entrar" onPress={onSubmit} loading={loading} />
      <Text style={styles.hint}>Cualquier correo con @ y contraseña de 4+ caracteres funcionan en la demo.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lead: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
