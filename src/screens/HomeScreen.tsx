import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card, DisclaimerBanner, PrimaryButton, ScreenContainer } from '../components';
import { useAppState } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { user, resetSession } = useAppState();

  function confirmLogout() {
    Alert.alert('Cerrar sesión', '¿Volver a la pantalla de bienvenida?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: () => {
          resetSession();
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        },
      },
    ]);
  }

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.name ?? 'usuario'}</Text>
          <Text style={styles.sub}>¿Qué deseas hacer hoy?</Text>
        </View>
        <Pressable onPress={confirmLogout} hitSlop={12}>
          <Text style={styles.logout}>Salir</Text>
        </Pressable>
      </View>
      <DisclaimerBanner text="Recuerda: los resultados son orientativos y simulados en esta fase del proyecto." />
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Nuevo análisis facial</Text>
        <Text style={styles.cardBody}>
          Toma una foto o elige una de tu galería. Te mostraremos un informe preliminar y recomendaciones generales.
        </Text>
        <PrimaryButton label="Comenzar análisis" onPress={() => navigation.navigate('ImagePicker')} />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.subtitle,
    color: colors.text,
  },
  sub: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  logout: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  card: {
    marginTop: spacing.lg,
  },
  cardTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cardBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
});
