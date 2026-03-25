import { useCallback, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components';
import { useAppState } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'FaceCamera'>;

export function FaceCameraScreen({ navigation }: Props) {
  const { setPendingImage } = useAppState();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<InstanceType<typeof CameraView>>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const takePicture = useCallback(async () => {
    if (!cameraRef.current || !cameraReady || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.88 });
      setPendingImage({
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
        source: 'camera',
      });
      navigation.replace('Preview');
    } catch {
      Alert.alert('Captura', 'No se pudo guardar la foto. Inténtalo de nuevo.');
    } finally {
      setCapturing(false);
    }
  }, [cameraReady, capturing, navigation, setPendingImage]);

  if (!permission) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackBody}>Comprobando permisos…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.fallback} edges={['top', 'bottom']}>
        <Text style={styles.fallbackTitle}>Permiso de cámara</Text>
        <Text style={styles.fallbackBody}>
          Necesitamos acceso a la cámara para mostrarte la guía y capturar el rostro.
        </Text>
        <PrimaryButton label="Permitir cámara" onPress={requestPermission} />
        <PrimaryButton label="Volver" variant="ghost" style={styles.gapTop} onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
        mirror
        mode="picture"
        onCameraReady={() => setCameraReady(true)}
        onMountError={(e) => {
          Alert.alert('Cámara', e.message);
        }}
      />

      <SafeAreaView style={styles.overlay} edges={['top']} pointerEvents="box-none">
        <View style={styles.topHints} pointerEvents="none">
          <Text style={styles.hintTitle}>Centra el rostro en el óvalo</Text>
          <Text style={styles.hintLine}>• Luz suave de frente, sin sombras duras</Text>
          <Text style={styles.hintLine}>• Retira gafas o pelo que tape el rostro si puedes</Text>
        </View>
      </SafeAreaView>

      <View style={styles.guideWrap} pointerEvents="none">
        <View style={styles.guideOval} />
      </View>

      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Capturar foto"
          disabled={!cameraReady || capturing}
          onPress={takePicture}
          style={({ pressed }) => [
            styles.shutterOuter,
            (!cameraReady || capturing) && styles.shutterDisabled,
            pressed && styles.shutterPressed,
          ]}
        >
          <View style={styles.shutterInner} />
        </Pressable>
        <PrimaryButton
          label="Volver"
          variant="ghost"
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  topHints: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  hintTitle: {
    ...typography.subtitle,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: spacing.sm,
  },
  hintLine: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  guideWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  guideOval: {
    width: '78%',
    aspectRatio: 3 / 4,
    borderRadius: 9999,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.92)',
    backgroundColor: 'transparent',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: spacing.md,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.surface,
  },
  shutterDisabled: {
    opacity: 0.45,
  },
  shutterPressed: {
    opacity: 0.85,
  },
  backBtn: {
    marginTop: spacing.xs,
  },
  fallback: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  fallbackTitle: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  fallbackBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  gapTop: {
    marginTop: spacing.sm,
  },
});
