import * as React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
// import { ToggleButton } from 'react-native-paper';
import ToggleButtons from 'components/ToggleButtons/ToggleButtons';
import { withSettings } from "components/Settings/Settings"
import getLength from "functions/getLength"
import { extendStart, getPathString } from "functions/geometry"


import Svg, {
  G,
  Rect,
  Path,
  Defs,
  ClipPath,
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

        <ClipTest
          traditionalOrSimplified={props.settings.traditionalOrSimplified}
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


const ClipTest = props => {
  return (
    <Svg width={1000} height={1000} style={{background:"#777"}}>
      <G transform="translate(0,400) scale(0.4,-0.4)">
        <Defs>
          <ClipPath id="test">
            <Path d="M 687 669 Q 718 648 754 623 Q 770 613 786 615 Q 798 618 801 632 Q 802 648 789 678 Q 780 697 746 708 Q 665 726 651 715 Q 647 711 651 697 Q 655 687 687 669 Z"/>
          </ClipPath>
        </Defs>

        <Rect x={0} y={0} width={1000} height={1000} fill="pink"></Rect>
        <AnimatedPathDash
          value={props.traditionalOrSimplified}
        />
      </G>
    </Svg>
  )
}


const points = [
  {x: 657, y: 710},
  {x: 750, y: 668},
  {x: 781, y: 634},
]

const length = getLength(points)
console.log("length",length)
const STROKE_WIDTH = 200;
const pathLength = length + STROKE_WIDTH/2
console.log("pathLength",pathLength)

const extendedMaskPoints = extendStart(points, STROKE_WIDTH / 2);
const animationStrokePath = getPathString(extendedMaskPoints)
console.log("animationStrokePath",animationStrokePath)


const AnimatedPath = Animated.createAnimatedComponent(Path);

const AnimatedPathDash = (props) => {
  const [dashoffsetAnimation] = React.useState(new Animated.Value(pathLength))

  React.useEffect(() => {
    Animated.timing(
      dashoffsetAnimation,
      {
        toValue: props.value==="traditional"?pathLength:0,
        duration: 1000,
      }
    ).start();
  }, [props.value])


  return (
    <AnimatedPath
      clipPath="url(#test)"
      fill="none"
      d={animationStrokePath}
      stroke="green"
      strokeLinecap="round"
      strokeLinejoin="miter"
      strokeWidth={STROKE_WIDTH}
      strokeDasharray={pathLength + "," + pathLength}
      strokeDashoffset={dashoffsetAnimation}
    />
  );
}
