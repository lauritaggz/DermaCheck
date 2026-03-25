import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton, ScreenContainer, TextField } from '../components';
import { useAppState } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { authService } from '../services';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { setUser, setConsent } = useAppState();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    const result = await authService.register({ name, email, password });
    setLoading(false);
    if ('error' in result) {
      Alert.alert('Registro incompleto', result.error);
      return;
    }
    setUser(result.user);
    setConsent({ accepted: false, acceptedAt: null, policyVersion: '1.0-demo' });
    navigation.reset({
      index: 0,
      routes: [{ name: 'Consent' }],
    });
  }

  return (
    <ScreenContainer scroll>
      <Text style={styles.lead}>Crea una cuenta de demostración para continuar el flujo.</Text>
      <TextField label="Nombre" value={name} onChangeText={setName} autoComplete="name" />
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
        autoComplete="password-new"
      />
      <PrimaryButton label="Registrarme" onPress={onSubmit} loading={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lead: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
});
