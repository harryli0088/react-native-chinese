import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { Button, Image, Platform, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import loadLocalResource from 'react-native-local-resource';
import { MonoText } from '../components/StyledText';
import TabBarIcon from '../components/TabBarIcon'; //<TabBarIcon focused={focused} name="md-book"/>
import { withSettings } from "../components/Settings/Settings"
import  { PanGestureHandler } from 'react-native-gesture-handler'
import  AnimatedPathFill from '../components/AnimatedElement/AnimatedPathFill'
import * as curveMatcher from 'curve-matcher'
import * as d3 from 'd3'

import dictionary from '../data/chineseOutput.txt'
import strokes from '../data/strokesOutput.txt'
import dimensions from "../constants/Layout"

import Svg, {
  Circle,
  G,
  Path,
  Line,
  Rect,
  Text as SvgText,
  ForeignObject,
} from 'react-native-svg';

const STROKE_WIDTH = 3

const FIELD_TO_PARSED_INDEX_MAP = {
  traditional: 0,
  simplified: 1,
  pinyinNumber: 2,
  pinyinTone: 3,
  english: 4
}

const RESTRICT_ROTATION_ANGLE = 0.1 * Math.PI
const SIMILARITY_THRESHOLD = 0.8
const DISTANCE_THRESHOLD = 0.10

class DrawScreen extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      status:"loading",
      userStrokes: [], //2d array of validated strokes
      inputStroke: [], //array of points for the stroke the user is currently entering
      strokeErrors: 0, //the number of times the user has messed up this stroke

      setIndex: -1, //the index in the dictionary.parsed that we are looking at
      characterIndex: 0, //the character in the set we are looking at

      showGuideDots: false,
    }

    this.inputStrokeStart = null //this is used to track the start of the stroke. if we don't have this, the gesture starts too late
  }

  componentDidMount() {
    this.loadDictionary()
    this.loadStrokes()
  }

  loadDictionary = async () => {
    this.dictionary = await loadLocalResource(dictionary).then(content => {
      return JSON.parse(content);
    });
    this.getNewSet()
    this.setStatus()
    console.log("LOAD DICTIONARY")
  }

  loadStrokes = async () => {
    this.strokes = await loadLocalResource(strokes).then(content => {
      return JSON.parse(content);
    });
    this.setStatus()
    console.log("LOAD STROKES")
  }

  setStatus = () => {
    if(this.dictionary && this.strokes) {
      this.setState({status: "done"})
    }
  }


  getNewSet = () => {
    const newSetIndex = Math.floor(Math.random()*this.dictionary.parsed.length) //generate a random set index

    this.setState({
      setIndex: newSetIndex, //set the new set
      characterIndex: 0, //reset the character index to the beginning
    })
    this.clearUserStrokes() //clear all of the strokes
  }

  getCurrentSet = () => {
    if(this.dictionary && this.dictionary.parsed && this.dictionary.parsed[this.state.setIndex]) { //if the dictionary exists AND the set index is valid
      return this.dictionary.parsed[this.state.setIndex] //return the parsed set in the dictionary
    }
    return null
  }

  getNextCharacter = () => {
    if(this.getCurrentSet().length-1 > this.state.characterIndex) { //if there are more characters remaining in the set
      this.setState({characterIndex: this.state.characterIndex+1}) //move to the next character
    }
    else { //else we are at the end of the set
      this.getNewSet() //get a new set
    }
    this.clearUserStrokes() //clear the strokes
  }

  addInputStroke = () => { //push the input stroke into the array of user strokes
    const inputStrokeCopy = JSON.parse(JSON.stringify(this.state.inputStroke)) //copy the input stroke
    const userStrokesCopy = JSON.parse(JSON.stringify(this.state.userStrokes)) //copy the user strokes
    userStrokesCopy.push(inputStrokeCopy) //push the input stroke copy
    this.setState({
      userStrokes: userStrokesCopy,
      strokeErrors: 0, //reset the errors count
      showGuideDots: false, //reset show guide dots
    })

    this.clearInputStroke() //clear the input stroke
  }

  clearInputStroke = () => { //clear the user input stroke
    this.setState({
      inputStroke: []
    })
  }

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
      const {
        currentCharacter,
      } = this.getChineseInfo()

      if(this.strokes[currentCharacter]) { //if this character has strokes
        const strokeIndex = this.state.userStrokes.length //the index of the stroke the user is currently attempting to write
        if(this.strokes[currentCharacter].medians[strokeIndex]) { //if there is another stroke in this character
          const scale = this.getStrokesScale()
          const mediansTransformed = this.strokes[currentCharacter].medians[strokeIndex].map(m => //convert the array of medians for the stroke from [x,y] array format into {x:x, y:y} key-value format
            ({
              x: scale*m[0], //scale the coordinates
              y: scale*m[1] //scale the coordinates
            })
          )

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
            startDistance < dimensions.window.width*DISTANCE_THRESHOLD &&
            endDistance < dimensions.window.width*DISTANCE_THRESHOLD
          ) {
            this.addInputStroke() //add the input stroke
          }
          else { //else the stroke was invalid
            this.setState({
              strokeErrors: this.state.strokeErrors + 1, //increment the errors count for this stroke
              showGuideDots: this.state.strokeErrors > 1 //if the user has made n+2 errors or more, show the guide dots
            })
          }
        }
      }
      else { //we don't have strokes to validate
        this.addInputStroke() //add the input stroke
      }

      this.clearInputStroke() //clear the stroke
    }
  }



  getStrokesScale = () => dimensions.window.width / 1000 //the strokes are hardcoded at a 1000x1000 container so scale the stroke down to fit our Svg

  getCurrentCharacter = chineseSet => {
    if(chineseSet.length > this.state.characterIndex) { //if this index is valid
      return chineseSet[this.state.characterIndex] //return the character
    }

    return null //else return nothing
  }

  renderGuideDots = (currentCharacter) => {
    if(
      this.state.showGuideDots && //if we want to show the guide dots
      this.strokes[currentCharacter] && //if we have the strokes for this character
      this.strokes[currentCharacter].medians && //if we have the medians for this character
      this.strokes[currentCharacter].medians[this.state.userStrokes.length] //if the median is valid
    ) {
      const medians = this.strokes[currentCharacter].medians[this.state.userStrokes.length] //get the medians for this stroke
      return medians.map((d,i) => {
        if(i===0 || i===medians.length-1) { //if this is the first or last median
          return (
            <Circle //render median
              key={i}
              cx={d[0]}
              cy={d[1]}
              r={10}
              stroke={i===0 ? "#00FF66" : "#FF0033"}
              strokeWidth={5}
            />
          )
        }
      })
    }
  }

  renderCurrentCharacter = currentCharacter => {
    if(currentCharacter) { //if this character is valid
      if(this.strokes[currentCharacter]) { //if there are strokes for this character
        const scale = this.getStrokesScale()
        const colorScale = d3.scaleLinear().domain([0, this.strokes[currentCharacter].strokes.length]).range(["red", "blue"])
        return ( //render via the stroke paths
          <G transform={"scale("+scale+","+scale+")"}>
            {this.strokes[currentCharacter].strokes.map((d,i) =>
              <AnimatedPathFill
                key={i}
                d={d}
                filled={colorScale(i)}
                show={this.state.userStrokes.length > i}
                duration={500}
                stroke={colorScale(i)}
                strokeWidth={4}
              />

            )}

            {/* <Path //render stroke
              key={i}
              d={d}
              fill={this.state.userStrokes.length>i ? colorScale(i) : "transparent"}
              stroke={colorScale(i)}
              strokeWidth={4}
              style={{transition: "1s"}}
            /> */}

            {this.renderGuideDots(currentCharacter)}
          </G>
        )
      }

      return ( //else we do not have the strokes for this character, render via text
        <SvgText
          x={dimensions.window.width/2}
          y={dimensions.window.width/2}
          dy="30%"
          textAnchor="middle"
          fill="#777"
          fontSize={0.8*dimensions.window.width}
          // style={{fontFamily:"space-mono"}}
          >
          {currentCharacter}
        </SvgText>
        // <ForeignObject
        //   key={this.state.characterIndex} //keep this here to make sure the text rerenders
        //   x={0.1*dimensions.window.width}
        //   y={0.1*dimensions.window.width}
        //   width={dimensions.window.width}
        //   height={dimensions.window.width}
        //   >
        //   <Text style={{fontFamily:"wts11", color:"#777", fontSize:(0.8*dimensions.window.width)}}>{currentCharacter}</Text>
        // </ForeignObject>
      )
    }

    return null //else return nothing
  }

  getNextButton = chineseSet => {
    if(chineseSet.length-1 <= this.state.characterIndex) {
      return <Button title="Next Set >" onPress={this.getNewSet}/>
    }

    return <Button title="Next Character >" onPress={this.getNextCharacter}/>
  }

  getChineseInfo = () => { //get all the info we need for this character
    const currentSet = this.getCurrentSet()
    const chineseSet = currentSet[ FIELD_TO_PARSED_INDEX_MAP[this.props.settings.traditionalOrSimplified] ]
    const pinyin = currentSet[FIELD_TO_PARSED_INDEX_MAP.pinyinTone]
    const english = currentSet[FIELD_TO_PARSED_INDEX_MAP.english]
    const currentCharacter = this.getCurrentCharacter(chineseSet)

    return {
      currentSet,
      chineseSet,
      pinyin,
      english,
      currentCharacter,
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
    if(this.state.status === "done") {
      const {
        currentSet,
        chineseSet,
        pinyin,
        english,
        currentCharacter,
      } = this.getChineseInfo()

      return (
        <View style={styles.container}>
          <PanGestureHandler onGestureEvent={this.handleGesture} onHandlerStateChange={this.onHandlerStateChange}>
            <Svg width={dimensions.window.width} height={dimensions.window.width}>
              <Rect //this is a dummy background
                width={dimensions.window.width}
                height={dimensions.window.width}
                fill="#666"
              />
              {this.renderCurrentCharacter(currentCharacter)}
              <G>
                {this.state.userStrokes.map((array,i) => this.renderPathFromPoints(array, i))}
                {this.renderPathFromPoints(this.state.inputStroke)}
              </G>
              <Rect //this transparent rect handles the on press in event
                width={dimensions.window.width}
                height={dimensions.window.width}
                fill="transparent"
                onPressIn={this.handlePressIn}
              />
            </Svg>
          </PanGestureHandler>

          <View>
            <Text style={[styles.centeredText, styles.chineseText]}>{chineseSet}</Text>
            <Text style={[styles.centeredText, styles.chineseText]}>{pinyin}</Text>
            {english.map((e,i) =>
              <Text key={i}  style={styles.centeredText}>- {e}</Text>
            )}
          </View>

          <View style={styles.tabBarInfoContainer}>
            <View style={{display:"flex", flexDirection:"row", marginTop:10}}>
              <View style={{width:"25%"}}>
                <Button
                  onPress={this.clearUserStrokes}
                  title="Clear"
                />
              </View>
              <View style={{width:"25%"}}>
                <Button
                  onPress={this.undoUserStroke}
                  title="Undo"
                />
              </View>
              <View style={{width:"50%"}}>
                {this.getNextButton(chineseSet)}
              </View>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={{display:"flex", justifyContent:"center", alignItems:"center", height:"100%"}}>
        <Text style={{fontSize:30}}>Loading...</Text>
      </View>
    )
  }
}

DrawScreen.navigationOptions = {
  header: null,
};

export default withSettings(DrawScreen)


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centeredText: {
    textAlign: "center",
  },
  chineseText: {
    fontSize: 20
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({ //top shadow
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 5,
  },
});
