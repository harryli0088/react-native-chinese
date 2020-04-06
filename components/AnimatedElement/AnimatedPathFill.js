import * as React from 'react';
import { Animated } from 'react-native';

import { Path, } from 'react-native-svg';


const AnimatedPath = Animated.createAnimatedComponent(Path);

const AnimatedPathFill = (props) => {
  const [fillAmination] = React.useState(new Animated.Value(props.show?1:0))

  React.useEffect(() => {
    Animated.timing(
      fillAmination,
      {
        toValue: props.show?1:0,
        duration: props.duration,
      }
    ).start();
  }, [props])

  return (
    <AnimatedPath
      {...props}
      fill={fillAmination.interpolate({
        inputRange: [0,1],
        outputRange: ["transparent",props.filled]
      })}
    />
  );
}

export default AnimatedPathFill
