import * as React from 'react';
import PropTypes from 'prop-types'
import { Button, Platform, StyleSheet, View, Text } from 'react-native';
import { withSettings, characterTermRestrictions } from "components/Settings/Settings"
import { withDictionary, withStrokes, withHsk } from "data/Data"
import { PanGestureHandler, ScrollView } from 'react-native-gesture-handler'
import Svg, { G, Circle, Path, Rect } from 'react-native-svg';
import Stroke from 'components/Stroke/Stroke'
import Character from 'components/Character/Character'
import * as curveMatcher from 'curve-matcher'
import transformArrayToObjectFormat from "functions/transformArrayToObjectFormat"
import getRandomRestrictedTermIndex from "functions/getRandomRestrictedTermIndex"
import dimensions from "constants/Layout"


export const FIELD_TO_PARSED_INDEX_MAP = {
  traditional: 0,
  simplified: 1,
  pinyinNumber: 2,
  pinyinTone: 3,
  english: 4
}

const STROKE_WIDTH = 3
const RESTRICT_ROTATION_ANGLE = 0.1 * Math.PI
const SIMILARITY_THRESHOLD = 0.8
const DISTANCE_THRESHOLD = 0.10

class DrawScreen extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      characterIndex: 0, //the character in the term we are looking at
      inputStroke: [], //array of points for the stroke the user is currently entering
      termIndex: 10215, //the index in the dictionary.parsed that we are looking at
      showGuideDots: false,
      strokeErrors: 0, //the number of times the user has messed up this stroke
      userStrokes: [], //2d array of validated strokes
      source: "",
    }

    this.inputStrokeStart = null //this is used to track the start of the stroke. if we don't have this, the gesture starts too late
  }

  componentDidUpdate(prevProps) {
    if(prevProps.dictionary!==this.props.dictionary) { //if the dictionary changed
      this.getNewTerm() //get a new term
    }
  }


  getNewTerm = () => {
    console.log("characterTermRestrictions[this.props.settings.characterTermRestriction]",characterTermRestrictions[this.props.settings.characterTermRestriction])
    const restrictionResults = getRandomRestrictedTermIndex(
      characterTermRestrictions[this.props.settings.characterTermRestriction], //get the array of restrictions,
      this.props.hsk,
      this.props.dictionary.map,
    )
    console.log("restrictionResults",restrictionResults)
    const newTermIndex = restrictionResults.index || Math.floor(Math.random()*this.props.dictionary.parsed.length) //try to get a term index from the restrictions, else generate a random term index
    const newTitle = restrictionResults.title || "Full Dictionary" //try to get a term index from the restrictions

    this.setState({
      termIndex: newTermIndex, //set the new term
      characterIndex: 0, //reset the character index to the beginning
      source: newTitle,
    })
    this.clearUserStrokes() //clear all of the strokes
  }

  getCurrentTerm = () => {
    return (this.props.dictionary?.parsed?.[this.state.termIndex]) //return the parsed term in the dictionary
  }

  getNextCharacter = () => {
    if(this.getCurrentTerm()?.[FIELD_TO_PARSED_INDEX_MAP.traditional].length-1 > this.state.characterIndex) { //if there are more characters remaining in the term
      this.setState({characterIndex: this.state.characterIndex+1}) //move to the next character
    }
    else { //else we are at the end of the term
      this.getNewTerm() //get a new term
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
      } = this.getChineseInfo()[0]

      if(this.props.strokes[currentCharacter]) { //if this character has strokes
        const strokeIndex = this.state.userStrokes.length //the index of the stroke the user is currently attempting to write
        if(this.props.strokes[currentCharacter].medians[strokeIndex]) { //if there is another stroke in this character
          const scale = this.getStrokesScale()
          const mediansTransformed = transformArrayToObjectFormat(this.props.strokes[currentCharacter].medians[strokeIndex], scale)

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

  getCurrentCharacter = chineseTerm => {
    if(chineseTerm.length > this.state.characterIndex) { //if this index is valid
      return chineseTerm[this.state.characterIndex] //return the character
    }

    return null //else return nothing
  }


  renderCurrentCharacter = currentCharacter => {
    if(currentCharacter) { //if this character is valid
      return (
        <Character
          character={currentCharacter}
          currentStroke={this.state.userStrokes.length}
          scale={this.getStrokesScale()}
          showGuideDots={this.state.showGuideDots}
          strokesData={this.props.strokes[currentCharacter]}
          width={dimensions.window.width}
        />
      )
    }

    return null //else return nothing
  }

  getNextButton = chineseTerm => {
    if(chineseTerm.length-1 <= this.state.characterIndex) {
      return <Button title="Next Term >" onPress={this.getNewTerm}/>
    }

    return <Button title="Next Character >" onPress={this.getNextCharacter}/>
  }

  getChineseInfo = () => { //get all the info we need for this character
    const currentTerm = this.getCurrentTerm()
    const allTerms = this.props.dictionary.map[ currentTerm[FIELD_TO_PARSED_INDEX_MAP.traditional] ] //get all the terms that this term maps to
    return allTerms.map(termIndex => {
      const term = this.props.dictionary.parsed[termIndex]
      const chineseTerm = term[ FIELD_TO_PARSED_INDEX_MAP[this.props.settings.traditionalOrSimplified] ]
      const pinyin = term[FIELD_TO_PARSED_INDEX_MAP.pinyinTone]
      const english = term[FIELD_TO_PARSED_INDEX_MAP.english]
      const currentCharacter = this.getCurrentCharacter(chineseTerm)

      return {
        chineseTerm,
        pinyin,
        english,
        currentCharacter,
      }
    })
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
    if(this.props.dictionary!==null && this.props.strokes!==null) {
      const allTerms = this.getChineseInfo()
      const {
        currentTerm,
        chineseTerm,
        currentCharacter,
      } = allTerms[0]

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

          <ScrollView style={styles.definitionsScrollContainer}>
            <Text style={[styles.centeredText, styles.chineseText]}>{this.state.source}</Text>
            <Text style={[styles.centeredText, styles.chineseText]}>{chineseTerm}</Text>
            {allTerms.map((term,i) =>
              <View key={i}>
                <Text style={[styles.centeredText, styles.chineseText]}>{term.pinyin}</Text>
                {term.english.map((e,j) =>
                  <Text key={j}  style={styles.centeredText}>- {e}</Text>
                )}
              </View>
            )}
          </ScrollView>

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
                {this.getNextButton(chineseTerm)}
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
  title: "test",
  headerTitle: "test",
};

DrawScreen.propTypes = {
  dictionary: PropTypes.object,
  strokes: PropTypes.object,
};

export default withSettings(
  withDictionary(
    withStrokes(
      withHsk(DrawScreen)
    )
  )
)


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
  definitionsScrollContainer: {
    marginBottom: 60
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
    display: "flex",
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingBottom: 10,
  },
});
