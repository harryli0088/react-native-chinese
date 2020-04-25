import * as React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text } from 'react-native';
import TabBarIcon from 'components/TabBarIcon'
// import HomeScreen from 'screens/HomeScreen'
// import LinksScreen from 'screens/LinksScreen'
import DictionaryScreen from 'screens/DictionaryScreen'
import DrawScreen from 'screens/DrawScreen'
import SettingsScreen from 'screens/SettingsScreen'

const Drawer = createDrawerNavigator()
const INITIAL_ROUTE_NAME = 'Draw';

export default function Navigation({ navigation, route }) {
  // Set the header title on the parent stack navigator depending on the
  // currently active tab. Learn more in the documentation:
  // https://reactnavigation.org/docs/en/screen-options-resolution.html
  navigation.setOptions({ headerTitle: getHeaderTitle(route) });

  return (
    <Drawer.Navigator initialRouteName={INITIAL_ROUTE_NAME}>
      <Drawer.Screen
        name="Write"
        component={DrawScreen}
        options={({route}) => ({
          title: 'Write',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-brush"/>,
        })}
      />

      <Drawer.Screen
        name="Dictionary"
        component={DictionaryScreen}
        options={({route}) => ({
          title: 'Dictionary',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-book"/>,
        })}
      />

      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={({route}) => ({
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-settings"/>,
        })}
      />
    </Drawer.Navigator>
  );
}

function getHeaderTitle(route) {
  return route.state?.routes[route.state.index]?.name ?? INITIAL_ROUTE_NAME;
}
