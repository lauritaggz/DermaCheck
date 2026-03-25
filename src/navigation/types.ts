import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Consent: undefined;
  Home: undefined;
  LegalAcceptances: undefined;
  ImagePicker: undefined;
  FaceCamera: undefined;
  Preview: undefined;
  Processing: undefined;
  Results: undefined;
  Recommendations: undefined;
};

export type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
