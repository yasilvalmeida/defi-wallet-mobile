import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {store} from './src/store';
import {AppNavigator} from './src/navigation/AppNavigator';
import {ThemeProvider} from './src/contexts/ThemeContext';
import {WalletProvider} from './src/contexts/WalletContext';
import {NotificationProvider} from './src/contexts/NotificationContext';
import {LoadingProvider} from './src/contexts/LoadingContext';

// Polyfills for React Native
import 'react-native-url-polyfill/auto';

const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Provider store={store}>
        <SafeAreaProvider>
          <ThemeProvider>
            <WalletProvider>
              <NotificationProvider>
                <LoadingProvider>
                  <NavigationContainer>
                    <StatusBar
                      barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                      backgroundColor="transparent"
                      translucent
                    />
                    <AppNavigator />
                  </NavigationContainer>
                </LoadingProvider>
              </NotificationProvider>
            </WalletProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App; 