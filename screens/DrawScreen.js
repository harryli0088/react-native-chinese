import * as React from 'react';
import PropTypes from 'prop-types'
import { Button, Platform, StyleSheet, View, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler'
import Svg, { G, Rect } from 'react-native-svg';
import memoizeOne from 'memoize-one'
import { withSettings, characterTermRestrictions } from "components/Settings/Settings"
import { withDictionary, withStrokes, withHsk } from "data/Data"
import Stroke from 'components/Stroke/Stroke'
import Character from 'components/Character/Character'
import Draw from 'components/Draw/Draw'
import * as curveMatcher from 'curve-matcher'
import getRandomRestrictedTermIndex from "functions/getRandomRestrictedTermIndex"
import uniqueMergeArrays from "functions/uniqueMergeArrays"
import dimensions from "constants/Layout"


export const FIELD_TO_PARSED_INDEX_MAP = {
  traditional: 0,
  simplified: 1,
  pinyinNumber: 2,
  pinyinTone: 3,
  english: 4
}

class DrawScreen extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      characterIndex: 0, //the character in the term we are looking at
      termIndex: 67605, //the index in the dictionary.parsed that we are looking at
      showGuideDots: false,
      strokeErrors: 0, //the number of times the user has messed up this stroke
      strokeIndex: 0,
      source: "",
    }
  }


  getDrawFunctions = (clear,undo) => { //get the clear and under functions from the Draw component
    this.clearUserStrokes = () => {
      console.log("I RUN")
      this.setState({strokeIndex: 0})
      clear()
    }
    this.undoUserStroke = () => {
      this.setState({strokeIndex: this.state.strokeIndex - 1})
      undo()
    }
  }

  componentDidUpdate(prevProps) {
    if(prevProps.dictionary!==this.props.dictionary) { //if the dictionary changed
      // this.getNewTerm() //get a new term
    }
  }


  getNewTerm = () => {
    const restrictionResults = getRandomRestrictedTermIndex(
      characterTermRestrictions[this.props.settings.characterTermRestriction], //get the array of restrictions,
      this.props.hsk,
      this.props.dictionary.map,
    )
    const newTermIndex = restrictionResults.index || Math.floor(Math.random()*this.props.dictionary.parsed.length) //try to get a term index from the restrictions, else generate a random term index
    const newTitle = restrictionResults.title || "Full Dictionary" //try to get a term index from the restrictions

    this.setState({
      termIndex: newTermIndex, //set the new term
      characterIndex: 0, //reset the character index to the beginning
      source: newTitle,
      strokeIndex: 0, //clear the strokes
    })

    this.clearUserStrokes() //clear all of the strokes
  }

  getCurrentTerm = () => {
    return (this.props.dictionary?.parsed?.[this.state.termIndex]) //return the parsed term in the dictionary
  }

  getNextCharacter = () => {
    if(this.getCurrentTerm()?.[FIELD_TO_PARSED_INDEX_MAP.traditional].length-1 > this.state.characterIndex) { //if there are more characters remaining in the term
      this.setState({
        characterIndex: this.state.characterIndex + 1, //move to the next character
        strokeIndex: 0, //clear the strokes
      })

      this.clearUserStrokes() //clear all of the strokes
    }
    else { //else we are at the end of the term
      this.getNewTerm() //get a new term
    }
  }



  getStrokesScale = () => dimensions.window.width / 1000 //the strokes are hardcoded at a 1000x1000 container so scale the stroke down to fit our Svg


  renderCurrentCharacter = currentCharacter => {
    if(currentCharacter) { //if this character is valid
      return (
        <Character
          character={currentCharacter}
          currentStrokeIndex={this.state.strokeIndex}
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

  getChineseInfo = memoizeOne(
    (currentTerm, characterIndex) => { //get all the info we need for this character
      const allTerms = uniqueMergeArrays( //get all the indecies that this term maps to
        this.props.dictionary.map[ currentTerm[FIELD_TO_PARSED_INDEX_MAP.traditional] ], //get all traditional mappings
        this.props.dictionary.map[ currentTerm[FIELD_TO_PARSED_INDEX_MAP.simplified] ], //get all simplified mappings
      )

      return allTerms.map(termIndex => {
        const term = this.props.dictionary.parsed[termIndex]
        const chineseTerm = term[ FIELD_TO_PARSED_INDEX_MAP[this.props.settings.traditionalOrSimplified] ]
        const pinyin = term[FIELD_TO_PARSED_INDEX_MAP.pinyinTone]
        const english = term[FIELD_TO_PARSED_INDEX_MAP.english]
        const currentCharacter = chineseTerm[characterIndex]

        return {
          chineseTerm,
          pinyin,
          english,
          currentCharacter,
        }
      })
    }
  )





  render() {
    if(this.props.dictionary!==null && this.props.strokes!==null) {
      const allTerms = this.getChineseInfo(this.getCurrentTerm(), this.state.characterIndex)
      const {
        currentTerm,
        chineseTerm,
        currentCharacter,
      } = allTerms[0]

      return (
        <View style={styles.container}>
          <View style={{position:"relative"}}>
            <Svg width={dimensions.window.width} height={dimensions.window.width} style={{position:"absolute", top:0, left:0}}>
              <Rect //this is a dummy background
                width={dimensions.window.width}
                height={dimensions.window.width}
                fill="#666"
              />
              {this.renderCurrentCharacter(currentCharacter)}
            </Svg>

            <Draw
              addInputStrokeCallback={() => this.setState({
                strokeIndex: this.state.strokeIndex + 1,
                strokeErrors: 0, //reset the errors count
                showGuideDots: false, //reset show guide dots
              })}
              invalidInputStrokeCallback={() => this.setState({
                strokeErrors: this.state.strokeErrors + 1, //increment the errors count for this stroke
                showGuideDots: this.state.strokeErrors > 1 //if the user has made n+2 errors or more, show the guide dots
              })}
              medians={this.props.strokes[currentCharacter].medians}
              passUpFunctions={this.getDrawFunctions}
              scale={this.getStrokesScale()}
              width={dimensions.window.width}
            />
          </View>


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
