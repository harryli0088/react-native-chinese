import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
// import { ToggleButton } from 'react-native-paper';
import ToggleButtons from '../components/ToggleButtons/ToggleButtons';
import { withSettings } from "../components/Settings/Settings"

const SettingsScreen = props => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View>
          <ToggleButtons
            value={props.settings.traditionalOrSimplified}
            options={[
              {value:"traditional",text:"Traditional"},
              {value:"simplified",text:"Simplified"},
            ]}
            onPress={(e, option) => props.setSetting("traditionalOrSimplified", option.value)}
          />
        </View>
      </ScrollView>
    </View>
  );
}

export default withSettings(SettingsScreen)


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
