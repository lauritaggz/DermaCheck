import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MobileOnlyScreen } from './src/components';
import { AppProvider } from './src/context/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      {Platform.OS === 'web' ? (
        <MobileOnlyScreen />
      ) : (
        <AppProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </AppProvider>
      )}
    </SafeAreaProvider>
  );
}
