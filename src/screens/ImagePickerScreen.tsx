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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso necesario', 'Activa la cámara en ajustes del dispositivo.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
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
      source: 'camera',
    });
    navigation.navigate('Preview');
  }

  return (
    <ScreenContainer scroll>
      <Text style={styles.lead}>
        Coloca el rostro centrado y con buena luz. Esta demo no valida calidad de imagen; en el Sprint 2 podremos reforzar esa capa.
      </Text>
      <View style={styles.actions}>
        <PrimaryButton label="Tomar foto" onPress={takePhoto} />
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
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  actions: {
    gap: spacing.sm,
  },
  gap: {
    marginTop: spacing.sm,
  },
});
