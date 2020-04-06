import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
// import { ToggleButton } from 'react-native-paper';
import ToggleButtons from '../components/ToggleButtons/ToggleButtons';
import { withSettings } from "../components/Settings/Settings"
import AnimatedElement from "../components/AnimatedElement/AnimatedElement"

import Svg, {
  Circle,
  G,
  Path,
  Line,
  Rect,
  Text as SvgText,
  ForeignObject,
} from 'react-native-svg';

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

        <Svg height="400" width="400">
          <AnimatedElement
            component={Rect}
            animateProps={{
              x:0,
              y:0,
              width:props.settings.traditionalOrSimplified==="traditional"?300:150,
              height:200,
              fill:"black",
            }}
            staticProps={{
              onPress:e => console.log("PRESS"),
            }}
            animationType="spring"
            animationOptions={{friction: 1}}
          />
        </Svg>
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
