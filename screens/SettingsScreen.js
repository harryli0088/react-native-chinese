import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { Animated, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

        {/* <Svg height="400" width="400">
          <AnimatedElement
            component={AnimatedRect}
            animateProps={{
              x:0,
              y:0,
              width:props.settings.traditionalOrSimplified==="traditional"?300:150,
              height:200,
              stroke:"black",
              strokeWidth:2,
            }}
            interpolateProps={{
              fill: {
                value:props.settings.traditionalOrSimplified==="traditional"?1:0,
                inputRange: [0,1],
                outputRange: ["red","blue"],
              }
            }}
            staticProps={{
              onPress:e => console.log("PRESS"),
            }}
            animationType="timing"
            animationOptions={{duration: 1000}}
          />
        </Svg> */}
        <FadeInView opacity={props.settings.traditionalOrSimplified==="traditional"?1:0}/>
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


const AnimatedRect = Animated.createAnimatedComponent(Rect);

const FadeInView = (props) => {
  const [fadeAnim] = React.useState(new Animated.Value(props.opacity))  // Initial value for opacity: 0
  console.log("props.opacity",props.opacity)

  React.useEffect(() => {
    console.log("effects props.opacity",props.opacity)
    Animated.timing(
      fadeAnim,
      {
        toValue: props.opacity,
        duration: 1000,
      }
    ).start();
  }, [props])

  return (
    <Svg height="400" width="400">
      <AnimatedRect
        x={0}
        y={0}
        width={100}
        height={100}
        fill={fadeAnim.interpolate({
          inputRange: [0,1],
          outputRange: ["red","blue"]
        })}
        // opacity={fadeAnim}
      />
    </Svg>
  );
}
