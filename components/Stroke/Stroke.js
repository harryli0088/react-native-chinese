import React from 'react'
import PropTypes from 'prop-types'
import { Animated } from 'react-native';
import { G, Circle, Path, Defs, ClipPath } from 'react-native-svg';
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
      dashoffsetAnimation: new Animated.Value(0), //initialize fully drawn
      opacityAnimation: new Animated.Value(1), //initialize fully drawn
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

  runAnimation = (stateKey, toValue, duration, callback) => {
    Animated.timing(
      stateKey, //animate the state animation value
      {
        toValue: toValue,
        duration: duration,
      }
    ).start(({finished}) => {
      callback?.(finished)
    })
  }

  componentDidMount() {
    this.runAnimation( //animate on mount (so all strokes start filled in then animate out)
      this.state.dashoffsetAnimation,
      this.props.isFilled?0:this.calculateInfo(this.props.medians).pathLength,
      this.props.duration,
    )
  }

  componentDidUpdate(prevProps) {
    if( //if we need to animate filling in the stroke
      prevProps.isFilled!==this.props.isFilled || //if the filled status changed
      prevProps.medians!==this.props.medians //if the medians data changed
    ) {
      this.runAnimation(
        this.state.dashoffsetAnimation,
        this.props.isFilled?0:this.calculateInfo(this.props.medians).pathLength,
        this.props.duration,
      )
    }
    else if( //if we need to animate the hint
      this.props.runHintAnimation>0 && //if the prop is greater than zero
      prevProps.runHintAnimation!==this.props.runHintAnimation //if the prop value has changed
    ) {
      this.runAnimation(
        this.state.dashoffsetAnimation,
        0, //fill the stroke
        2*this.props.duration/3,
        () => this.runAnimation( //callback
          this.state.dashoffsetAnimation, //the unfill it
          this.calculateInfo(this.props.medians).pathLength,
          1,
        ),
      )
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

    const guideDots = this.props.showGuideDots ? (
      <G>
        <Circle //first dot
          cx={mediansTransformed[0].x}
          cy={mediansTransformed[0].y}
          r={10}
          stroke="#00FF66" //green
          strokeWidth={5}
        />

        <Circle //last dot
          cx={mediansTransformed[mediansTransformed.length-1].x}
          cy={mediansTransformed[mediansTransformed.length-1].y}
          r={10}
          stroke="#FF0033" //red
          strokeWidth={5}
        />
      </G>
    ) : null


    return (
      <React.Fragment>
        <G opacity={this.state.opacityAnimation}>
          {clip}
          {outline}
          {fill}
          {guideDots}
        </G>
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
  runHintAnimation: PropTypes.number.isRequired,
  showGuideDots: PropTypes.bool.isRequired,
  //showOutline: PropTypes.bool.isRequired,
}

export default Stroke
