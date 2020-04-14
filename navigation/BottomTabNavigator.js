import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as React from 'react';

import TabBarIcon from 'components/TabBarIcon'
// import HomeScreen from 'screens/HomeScreen'
// import LinksScreen from 'screens/LinksScreen'
import DictionaryScreen from 'screens/DictionaryScreen'
import DrawScreen from 'screens/DrawScreen'
import SettingsScreen from 'screens/SettingsScreen'

const BottomTab = createBottomTabNavigator()
const INITIAL_ROUTE_NAME = 'Draw';

export default function BottomTabNavigator({ navigation, route }) {
  // Set the header title on the parent stack navigator depending on the
  // currently active tab. Learn more in the documentation:
  // https://reactnavigation.org/docs/en/screen-options-resolution.html
  navigation.setOptions({ headerTitle: getHeaderTitle(route) });

  return (
    <BottomTab.Navigator initialRouteName={INITIAL_ROUTE_NAME}>
      <BottomTab.Screen
        name="Write"
        component={DrawScreen}
        options={({route}) => ({
          title: 'Write',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-brush"/>,
        })}
      />

      <BottomTab.Screen
        name="Dictionary"
        component={DictionaryScreen}
        options={({route}) => ({
          title: 'Dictionary',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-book"/>,
        })}
      />

      <BottomTab.Screen
        name="Settings"
        component={SettingsScreen}
        options={({route}) => ({
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-settings"/>,
        })}
      />
    </BottomTab.Navigator>
  );
}

function getHeaderTitle(route) {
  return route.state?.routes[route.state.index]?.name ?? INITIAL_ROUTE_NAME;
}
