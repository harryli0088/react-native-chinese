import * as React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';
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
  navigation.setOptions({
    headerTitle: getHeaderTitle(route),
  });

  return (
    <Drawer.Navigator initialRouteName={INITIAL_ROUTE_NAME}>
      <Drawer.Screen
        name="Write"
        component={DrawScreen}
        options={({route}) => ({
          headerTitle: 'Write',
          headerLeft: () => <ToggleDrawButton/>,
        })}
      />

      <Drawer.Screen
        name="Dictionary"
        component={DictionaryScreen}
        options={({route}) => ({
          headerTitle: 'Dictionary',
          headerLeft: () => <ToggleDrawButton/>,
        })}
      />

      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={({route}) => ({
          headerTitle: 'Settings',
          headerLeft: () => <ToggleDrawButton/>,
        })}
      />
    </Drawer.Navigator>
  );
}

function getHeaderTitle(route) {
  return route.state?.routes[route.state.index]?.name ?? INITIAL_ROUTE_NAME;
}



export function ToggleDrawButton() {
  const navigation = useNavigation();
  console.log("navigation", navigation, "DrawerActions",DrawerActions)
  return (
    <View style={styles.toggleDrawButtonContainer}>
      <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={styles.toggleDrawButton}>
        <TabBarIcon name="md-menu"/>
      </TouchableOpacity>
    </View>
  );
}



const styles = StyleSheet.create({
  toggleDrawButtonContainer: {
    paddingLeft: 10,
  },
  toggleDrawButton: {
    textAlign: "center",
    color: "#000"
  },
});
