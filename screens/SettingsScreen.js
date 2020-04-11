import * as React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
// import { ToggleButton } from 'react-native-paper';
import ToggleButtons from 'components/ToggleButtons/ToggleButtons';
import { withSettings } from "components/Settings/Settings"
import getLength from "functions/getLength"
import { extendStart, getPathString } from "functions/geometry"
import { Dropdown } from 'react-native-material-dropdown';

import Svg, {
  G,
  Rect,
  Path,
  Defs,
  ClipPath,
} from 'react-native-svg';

import { characterSetRestrictions } from "components/Settings/Settings"

const characterSetOptions = Object.keys(characterSetRestrictions).map(value => ({value}))

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

        <Dropdown
          label='Restrict the words to'
          data={characterSetOptions}
          value={props.settings.characterSetRestriction}
          onChangeText={value => props.setSetting("characterSetRestriction", value)}
        />
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
