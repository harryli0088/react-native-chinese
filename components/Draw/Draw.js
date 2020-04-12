import * as React from 'react';
import PropTypes from 'prop-types'
import { PanGestureHandler } from 'react-native-gesture-handler'
import Svg, { G, Circle, Path, Rect } from 'react-native-svg';
import * as curveMatcher from 'curve-matcher'
import transformArrayToObjectFormat from "functions/transformArrayToObjectFormat"


const STROKE_WIDTH = 3
const RESTRICT_ROTATION_ANGLE = 0.1 * Math.PI
const SIMILARITY_THRESHOLD = 0.8
const DISTANCE_THRESHOLD = 0.10

class Draw extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      inputStroke: [], //array of points for the stroke the user is currently entering
      userStrokes: [], //2d array of validated strokes
    }

    this.inputStrokeStart = null //this is used to track the start of the stroke. if we don't have this, the gesture starts too late
  }

  componentDidMount() {
    this.props.passUpFunctions(this.clearUserStrokes, this.undoUserStroke)
  }



  addInputStroke = () => { //push the input stroke into the array of user strokes
    const inputStrokeCopy = JSON.parse(JSON.stringify(this.state.inputStroke)) //copy the input stroke
    const userStrokesCopy = JSON.parse(JSON.stringify(this.state.userStrokes)) //copy the user strokes
    userStrokesCopy.push(inputStrokeCopy) //push the input stroke copy
    this.setState({
      userStrokes: userStrokesCopy,
    })

    this.props.addInputStrokeCallback()

    this.clearInputStroke() //clear the input stroke
  }

  clearInputStroke = () => this.setState({inputStroke: []}) //clear the user input stroke

  clearUserStrokes = () => this.setState({userStrokes: []}) //clear all the strokes

  undoUserStroke = () => this.setState({userStrokes: this.state.userStrokes.slice(0, this.state.userStrokes.length-1)}) //remove the last stroke in the user strokes array



  handlePressIn = e => { //this happens before gesture
    this.inputStrokeStart = {x:e.nativeEvent.locationX, y:e.nativeEvent.locationY} //record the press position because the gesture events don't record this
  }

  handleGesture = e => {
    const inputStrokeCopy = JSON.parse(JSON.stringify(this.state.inputStroke)) //copy the input stroke

    if(this.inputStrokeStart) { //if we need to record the start of the stroke first
      inputStrokeCopy.push(this.inputStrokeStart)
    }
    inputStrokeCopy.push({x:e.nativeEvent.x, y:e.nativeEvent.y}) //push the point the user moved to

    this.setState({
      inputStroke: inputStrokeCopy
    })

    this.inputStrokeStart = null //clear the input stroke start
  }

  onHandlerStateChange = e => {
    if(e.nativeEvent.oldState===0 && e.nativeEvent.state===2) { //gesture started
    }
    else if(e.nativeEvent.oldState===4 && e.nativeEvent.state===5) { //gesture ended
      if(this.props.medians) { //if this character has strokes
        const strokeIndex = this.state.userStrokes.length //the index of the stroke the user is currently attempting to write
        if(this.props.medians[strokeIndex]) { //if there is another stroke in this character
          const mediansTransformed = transformArrayToObjectFormat(this.props.medians[strokeIndex], this.props.scale)

          const similarity = curveMatcher.shapeSimilarity(this.state.inputStroke, mediansTransformed, { restrictRotationAngle: RESTRICT_ROTATION_ANGLE }) //compare the similarity
          const startDistance = Math.hypot( //calculate the distance between the start point and the start median
            this.state.inputStroke[0].x - mediansTransformed[0].x,
            this.state.inputStroke[0].y - mediansTransformed[0].y
          )
          const endDistance = Math.hypot( //calculate the distance between the end point and the end median
            this.state.inputStroke[this.state.inputStroke.length-1].x - mediansTransformed[mediansTransformed.length-1].x,
            this.state.inputStroke[this.state.inputStroke.length-1].y - mediansTransformed[mediansTransformed.length-1].y
          )
          console.log("strokeIndex",strokeIndex,"similarity",similarity,"startDistance",startDistance,"endDistance",endDistance,"strokeErrors",this.state.strokeErrors)
          if( //if the stroke was similar enough AND distance-wise close enough
            similarity > SIMILARITY_THRESHOLD &&
            startDistance < this.props.width*DISTANCE_THRESHOLD &&
            endDistance < this.props.width*DISTANCE_THRESHOLD
          ) {
            this.addInputStroke() //add the input stroke
          }
          else { //else the stroke was invalid
            this.props.invalidInputStrokeCallback()
          }
        }
      }
      else { //we don't have strokes to validate
        this.addInputStroke() //add the input stroke
      }

      this.clearInputStroke() //clear the stroke
    }
  }



  renderPathFromPoints = (points, index) => {
    if(points.length > 1) {
      return (
        <Path
          key={index}
          d={"M"+points.map(p => p.x+" "+p.y).join("L")}
          stroke="white"
          strokeWidth={STROKE_WIDTH}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )
    }
    else if(points.length > 0) {
      return <Circle key={index} cx={points[0].x} cy={points[0].y} r={STROKE_WIDTH/2} fill="white"/>
    }
  }



  render() {
    return (
      <PanGestureHandler onGestureEvent={this.handleGesture} onHandlerStateChange={this.onHandlerStateChange}>
        <Svg width={this.props.width} height={this.props.width}>
          <G>
            {this.state.userStrokes.map((array,i) => this.renderPathFromPoints(array, i))}
            {this.renderPathFromPoints(this.state.inputStroke)}
          </G>
          <Rect //this transparent rect handles the on press in event
            width={this.props.width}
            height={this.props.width}
            fill="transparent"
            onPressIn={this.handlePressIn}
          />
        </Svg>
      </PanGestureHandler>
    )
  }
}

Draw.defaultProps = {
  addInputStrokeCallback: () => {},
  passUpFunctions: () => {},
  scale: 1,
  width: 400,
};

Draw.propTypes = {
  addInputStrokeCallback: PropTypes.func,
  invalidInputStrokeCallback: PropTypes.func,
  medians: PropTypes.array,
  passUpFunctions: PropTypes.func,
  scale: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
};

export default Draw
