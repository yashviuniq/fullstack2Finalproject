import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { store } from './src/store';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';

const AppContent: React.FC = () => {
  const { isDark } = useAppTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </ThemeProvider>
    </Provider>
  );
}
