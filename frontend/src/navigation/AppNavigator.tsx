import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../store';
import { StudentDashboardScreen } from '../screens/StudentDashboardScreen';
import { TeacherLeaderboardScreen } from '../screens/TeacherLeaderboardScreen';

export type AppStackParamList = {
  StudentDashboard: undefined;
  TeacherLeaderboard: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator: React.FC = () => {
  const role = useAppSelector((state) => state.auth.role);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {role === 'TEACHER' ? (
        <Stack.Screen name="TeacherLeaderboard" component={TeacherLeaderboardScreen} />
      ) : (
        <Stack.Screen name="StudentDashboard" component={StudentDashboardScreen} />
      )}
    </Stack.Navigator>
  );
};
