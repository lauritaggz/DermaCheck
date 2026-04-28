import * as ImagePicker from 'expo-image-picker';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton, ScreenContainer } from '../components';
import { useAppState } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ImagePicker'>;

export function ImagePickerScreen({ navigation }: Props) {
  const { setPendingImage } = useAppState();

  async function pickFromGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso necesario', 'Activa el acceso a la galería en ajustes del dispositivo.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    setPendingImage({
      uri: a.uri,
      width: a.width,
      height: a.height,
      source: 'gallery',
    });
    navigation.navigate('Preview');
  }

  function openInAppCamera() {
    navigation.navigate('FaceCamera');
  }

  return (
    <ScreenContainer scroll>
      <Text style={styles.lead}>
        El sistema cuenta con una guía asistida para centrar el rostro correctamente. Tras la captura, se validará
        automáticamente la iluminación y el encuadre antes de proceder al análisis dermatológico.
      </Text>
      <View style={styles.tips}>
        <Text style={styles.tipItem}>• Centra el rostro en el óvalo y mira de frente.</Text>
        <Text style={styles.tipItem}>• Luz uniforme de frente; evita contraluz fuerte.</Text>
        <Text style={styles.tipItem}>• Tras la foto, validamos luz y encuadre de forma básica.</Text>
      </View>
      <View style={styles.actions}>
        <PrimaryButton label="Abrir cámara con guía" onPress={openInAppCamera} />
        <PrimaryButton
          label="Elegir de la galería"
          variant="secondary"
          style={styles.gap}
          onPress={pickFromGallery}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lead: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  tips: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tipItem: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  actions: {
    gap: spacing.sm,
  },
  gap: {
    marginTop: spacing.sm,
  },
});
