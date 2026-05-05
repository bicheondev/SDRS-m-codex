import 'react-native-gesture-handler';

import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './src/nativeStyleRuntime.js';
import { RnwApp } from './src/RnwApp.jsx';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Material Icons Round': require('./assets/fonts/MaterialIconsRound-Regular.otf'),
    'Material Symbols Rounded': require('./assets/fonts/MaterialSymbolsRounded.ttf'),
    'Pretendard GOV': require('./assets/fonts/PretendardGOV-Regular.otf'),
    'Pretendard GOV Bold': require('./assets/fonts/PretendardGOV-Bold.otf'),
    'Pretendard GOV Medium': require('./assets/fonts/PretendardGOV-Medium.otf'),
    'Pretendard GOV SemiBold': require('./assets/fonts/PretendardGOV-SemiBold.otf'),
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#ffffff' }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <RnwApp />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
