import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { ConsentScreen } from '../screens/ConsentScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ImagePickerScreen } from '../screens/ImagePickerScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { PreviewScreen } from '../screens/PreviewScreen';
import { ProcessingScreen } from '../screens/ProcessingScreen';
import { RecommendationsScreen } from '../screens/RecommendationsScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions = {
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.text, fontWeight: '600' as const },
  contentStyle: { backgroundColor: colors.background },
};

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={screenOptions}>
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar sesión' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Crear cuenta' }} />
        <Stack.Screen name="Consent" component={ConsentScreen} options={{ title: 'Consentimiento' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio', headerBackVisible: false }} />
        <Stack.Screen
          name="ImagePicker"
          component={ImagePickerScreen}
          options={{ title: 'Nuevo análisis' }}
        />
        <Stack.Screen name="Preview" component={PreviewScreen} options={{ title: 'Vista previa' }} />
        <Stack.Screen name="Processing" component={ProcessingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Informe preliminar' }} />
        <Stack.Screen
          name="Recommendations"
          component={RecommendationsScreen}
          options={{ title: 'Recomendaciones' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
