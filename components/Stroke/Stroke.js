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

class Stroke extends React.Component {
  constructor(props) {
    super(props)

    const {
      pathLength
    } = this.calculateInfo(props.medians)

    this.state = {
      dashoffsetAnimation: new Animated.Value(0) //initialize fully drawn
    }
  }

  calculateInfo = memoizeOne(
    (medians) => { //memoize this so we only need to do this when a stroke loads
      const mediansTransformed = transformArrayToObjectFormat(medians) //transform the medians from array to object format
      const pathLength = getLength(mediansTransformed) + STROKE_WIDTH/2 + 10 //get the path length then add some constants
      const extendedMaskPoints = extendStart(mediansTransformed, STROKE_WIDTH / 2); //extend the points so the animation fills the clip path
      const animationStrokePath = getPathString(extendedMaskPoints) //get the path string based on the extended points

      return {
        animationStrokePath,
        mediansTransformed,
        pathLength
      }
    }
  )

  animate = () => {
    const {
      pathLength
    } = this.calculateInfo(this.props.medians)

    Animated.timing(
      this.state.dashoffsetAnimation, //animate the state animation value
      {
        toValue: this.props.isFilled?0:pathLength,
        duration: this.props.duration,
      }
    ).start()
  }

  componentDidMount() {
    this.animate() //animate on mount (so all strokes start fileld in then animate out)
  }

  componentDidUpdate(prevProps) {
    if(prevProps.isFilled !== this.props.isFilled) { //if the filled status is different
      this.animate() //animate
    }
  }

  render() {
    const {
      animationStrokePath,
      mediansTransformed,
      pathLength
    } = this.calculateInfo(this.props.medians)


    const clip = (
      <Defs>
        <ClipPath id={this.props.id}>
          <Path d={this.props.d}/>
        </ClipPath>
      </Defs>
    )

    // const background = (
    //   <Path
    //     d={this.props.d}
    //     fill="#ddd"
    //   />
    // )

    const outline = (
      <Path
        d={this.props.d}
        stroke={this.props.color}
        strokeWidth={4}
      />
    )

    const fill = (
      <AnimatedPath
        clipPath={"url(#"+this.props.id+")"}
        fill="none"
        d={animationStrokePath}
        stroke={this.props.color}
        strokeLinecap="round"
        strokeLinejoin="miter"
        strokeWidth={STROKE_WIDTH}
        strokeDasharray={pathLength + "," + pathLength}
        strokeDashoffset={this.state.dashoffsetAnimation}
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
