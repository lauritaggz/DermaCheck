import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton, ScreenContainer } from '../components';
import { useAppState } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

export function PreviewScreen({ navigation }: Props) {
  const { pendingImage } = useAppState();

  useEffect(() => {
    if (!pendingImage) {
      navigation.replace('ImagePicker');
    }
  }, [navigation, pendingImage]);

  if (!pendingImage) {
    return null;
  }

  return (
    <ScreenContainer scroll>
      <Text style={styles.lead}>Revisa la imagen. Si no te convence, vuelve atrás y captura otra.</Text>
      <View style={styles.frame}>
        <Image source={{ uri: pendingImage.uri }} style={styles.image} resizeMode="cover" />
      </View>
      <Text style={styles.meta}>
        Origen: {pendingImage.source === 'camera' ? 'Cámara' : 'Galería'}
      </Text>
      <PrimaryButton label="Continuar al análisis" onPress={() => navigation.navigate('Processing')} />
      <PrimaryButton
        label="Elegir otra imagen"
        variant="ghost"
        style={styles.back}
        onPress={() => navigation.goBack()}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lead: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  frame: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    aspectRatio: 3 / 4,
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  back: {
    marginTop: spacing.sm,
  },
});
