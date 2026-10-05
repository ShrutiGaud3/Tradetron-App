import React, { useState } from 'react';
import { StyleSheet, Modal, View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

import { SplashScreen } from '../screens/auth/SplashScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OtpVerificationScreen } from '../screens/auth/OtpVerificationScreen';
import { PinLockScreen } from '../screens/auth/PinLockScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

import { DashboardScreen } from '../screens/DashboardScreen';
import { StrategiesScreen } from '../screens/StrategiesScreen';
import { PositionsScreen } from '../screens/PositionsScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { BrokersScreen } from '../screens/BrokersScreen';
import { DeployModalScreen } from '../screens/DeployModalScreen';
import { StrategyBuilderModal } from '../screens/StrategyBuilderModal';
import { NotificationsModal } from '../components/notifications/NotificationsModal';
import { AnalyticsModal } from '../components/analytics/AnalyticsModal';

import { Colors, Shadows, BorderRadius } from '../theme';
import { Strategy } from '../types';
import { useAppStore } from '../store/useAppStore';

const Tab = createBottomTabNavigator();

export const RootNavigator: React.FC = () => {
  const authStage = useAppStore((state) => state.authStage);
  const otpTarget = useAppStore((state) => state.otpTarget);
  const isProfileOpen = useAppStore((state) => state.isProfileOpen);

  const finishSplash = useAppStore((state) => state.finishSplash);
  const finishOnboarding = useAppStore((state) => state.finishOnboarding);
  const goToLogin = useAppStore((state) => state.goToLogin);
  const requestOtp = useAppStore((state) => state.requestOtp);
  const verifyOtpSuccess = useAppStore((state) => state.verifyOtpSuccess);
  const unlockWithPinSuccess = useAppStore((state) => state.unlockWithPinSuccess);
  const logout = useAppStore((state) => state.logout);
  const setProfileOpen = useAppStore((state) => state.setProfileOpen);

  const [deployModalVisible, setDeployModalVisible] = useState(false);
  const [selectedStrategyToDeploy, setSelectedStrategyToDeploy] = useState<Strategy | null>(null);
  const [builderModalVisible, setBuilderModalVisible] = useState(false);

  const handleOpenDeploy = (strategy: Strategy) => {
    setSelectedStrategyToDeploy(strategy);
    setDeployModalVisible(true);
  };

  // 1. Splash Screen
  if (authStage === 'SPLASH') {
    return <SplashScreen onFinish={finishSplash} />;
  }

  // 2. Onboarding Carousel
  if (authStage === 'ONBOARDING') {
    return (
      <OnboardingScreen 
        onComplete={finishOnboarding} 
        onLoginPress={goToLogin} 
      />
    );
  }

  // 3. Login Screen
  if (authStage === 'LOGIN') {
    return (
      <LoginScreen 
        onSendOtp={(target) => requestOtp(target)}
        onBiometricLogin={() => unlockWithPinSuccess()}
        onDirectLogin={() => unlockWithPinSuccess()}
      />
    );
  }

  // 4. OTP Verification Screen
  if (authStage === 'OTP') {
    return (
      <OtpVerificationScreen
        identifier={otpTarget}
        onVerifySuccess={verifyOtpSuccess}
        onBack={goToLogin}
      />
    );
  }

  // 5. Security PIN & Biometric Lock Screen
  if (authStage === 'PIN_LOCK') {
    return (
      <PinLockScreen 
        onUnlockSuccess={unlockWithPinSuccess} 
      />
    );
  }

  // 6. Main App Shell (Authenticated)
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textTertiary,
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: styles.tabItem,
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarLabel: 'Portfolio',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons 
                name={focused ? "view-dashboard" : "view-dashboard-outline"} 
                size={23} 
                color={color} 
              />
            ),
          }}
        />

        <Tab.Screen
          name="Strategies"
          options={{
            tabBarLabel: 'Strategies',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons 
                name={focused ? "robot" : "robot-outline"} 
                size={23} 
                color={color} 
              />
            ),
          }}
        >
          {() => (
            <StrategiesScreen 
              onOpenDeploy={handleOpenDeploy}
              onOpenBuilder={() => setBuilderModalVisible(true)}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Positions"
          component={PositionsScreen}
          options={{
            tabBarLabel: 'Positions',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons 
                name={focused ? "lightning-bolt" : "lightning-bolt-outline"} 
                size={23} 
                color={color} 
              />
            ),
          }}
        />

        <Tab.Screen
          name="Orders"
          component={OrdersScreen}
          options={{
            tabBarLabel: 'Orders',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons 
                name={focused ? "clipboard-text" : "clipboard-text-outline"} 
                size={23} 
                color={color} 
              />
            ),
          }}
        />

        <Tab.Screen
          name="Brokers"
          component={BrokersScreen}
          options={{
            tabBarLabel: 'Brokers',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons 
                name={focused ? "bank" : "bank-outline"} 
                size={23} 
                color={color} 
              />
            ),
          }}
        />
      </Tab.Navigator>

      {/* Global Modals */}
      <DeployModalScreen
        visible={deployModalVisible}
        strategy={selectedStrategyToDeploy}
        onClose={() => setDeployModalVisible(false)}
      />

      <StrategyBuilderModal
        visible={builderModalVisible}
        onClose={() => setBuilderModalVisible(false)}
        onOpenDeploy={(strategy) => handleOpenDeploy(strategy)}
      />

      {/* Module 6: Realtime Notification Hub & Analytics Modals */}
      <NotificationsModal />
      <AnalyticsModal />

      {/* Profile Modal Screen */}
      <Modal visible={isProfileOpen} animationType="slide">
        <ProfileScreen onLogout={logout} />
      </Modal>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(37, 99, 235, 0.15)',
    height: Platform.OS === 'ios' ? 84 : 62,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 6,
    elevation: 10,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tabItem: {
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
  },
});
