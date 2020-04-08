import React from 'react'
import PropTypes from 'prop-types'
import { Animated } from 'react-native';
import { Path, Defs, ClipPath } from 'react-native-svg';
import getLength from "functions/getLength"
import { extendStart, getPathString } from "functions/geometry"
import transformArrayToObjectFormat from "functions/transformArrayToObjectFormat"
import memoizeOne from 'memoize-one'

const AnimatedPath = Animated.createAnimatedComponent(Path);
const STROKE_WIDTH = 200;

const calculateInfo = memoizeOne(
  (medians) => {
    const mediansTransformed = transformArrayToObjectFormat(medians)
    const length = getLength(mediansTransformed)
    const pathLength = length + STROKE_WIDTH/2 + 10
    const extendedMaskPoints = extendStart(mediansTransformed, STROKE_WIDTH / 2);
    const animationStrokePath = getPathString(extendedMaskPoints)

    return {
      animationStrokePath,
      extendedMaskPoints,
      length,
      mediansTransformed,
      pathLength
    }
  }
)

const Stroke = (props) => {
  const {
    animationStrokePath,
    extendedMaskPoints,
    length,
    mediansTransformed,
    pathLength
  } = calculateInfo(props.medians)

  const [dashoffsetAnimation] = React.useState(new Animated.Value(props.isFilled?0:(pathLength)))

  React.useEffect(() => {
    Animated.timing(
      dashoffsetAnimation,
      {
        toValue: props.isFilled?0:(pathLength),
        duration: props.duration,
      }
    ).start();
  }, [props.isFilled])


  const clip = (
    <Defs>
      <ClipPath id={props.id}>
        <Path d={props.d}/>
      </ClipPath>
    </Defs>
  )

  const background = null

  const outline = (
    <Path
      d={props.d}
      stroke={props.color}
      strokeWidth={4}
    />
  )

  const fill = (
    <AnimatedPath
      clipPath={"url(#"+props.id+")"}
      fill="none"
      d={animationStrokePath}
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="miter"
      strokeWidth={STROKE_WIDTH}
      strokeDasharray={pathLength + "," + pathLength}
      strokeDashoffset={dashoffsetAnimation}
    />
  )


  return (
    <React.Fragment>
      {clip}
      {outline}
      {fill}
    </React.Fragment>
  );
}

Stroke.propTypes = {
  color: PropTypes.string.isRequired,
  d: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired,
  isFilled: PropTypes.bool.isRequired,
  medians: PropTypes.array.isRequired,
  //showOutline: PropTypes.bool.isRequired,
}

export default Stroke
