import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton, ScreenContainer } from '../components';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <ImageBackground
      source={require('../../assets/welcome_bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScreenContainer
        scroll
        style={[styles.scroll, { paddingTop: insets.top + spacing.lg }]}
        backgroundColor="transparent"
      >
        <View style={styles.hero}>
          <Text style={styles.title}>Su piel, bajo la mirada experta</Text>
          <Text style={styles.body}>
            DermaCheck le guía en un análisis detallado del rostro para entender el estado actual de su piel y
            recibir recomendaciones personalizadas de grado profesional.
          </Text>
        </View>
        <PrimaryButton label="Iniciar sesión" onPress={() => navigation.navigate('Login')} />
        <PrimaryButton
          label="Crear cuenta"
          variant="secondary"
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Register')}
        />
        <Text style={styles.footnote}>Sistema de Análisis Dermatológico v1.0</Text>
      </ScreenContainer>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: spacing.xxl,
    backgroundColor: 'transparent',
  },
  hero: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.display,
    color: colors.text,
    marginBottom: spacing.md,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  secondaryBtn: {
    marginTop: spacing.sm,
  },
  footnote: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
