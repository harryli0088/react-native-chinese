import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { Button, Image, Platform, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import loadLocalResource from 'react-native-local-resource';
import { MonoText } from '../components/StyledText';
import TabBarIcon from '../components/TabBarIcon'; //<TabBarIcon focused={focused} name="md-book"/>
import { withSettings } from "../components/Settings/Settings"
import  {PanGestureHandler} from 'react-native-gesture-handler'

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
} from 'react-native-svg';

const strokeWidth = 10

const FIELD_TO_PARSED_INDEX_MAP = {
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
      status:"loading",
      points: [],
      setIndex: -1,
      characterIndex: 0,
    }
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
    const newSetIndex = Math.floor(Math.random()*this.dictionary.parsed.length)

    this.setState({
      setIndex: newSetIndex,
      characterIndex: 0,
    })
    this.clearPoints()
  }

  getCurrentSet = () => {
    if(this.dictionary && this.dictionary.parsed && this.dictionary.parsed[this.state.setIndex]) {
      return this.dictionary.parsed[this.state.setIndex]
    }
    return null
  }

  getNextCharacter = () => {
    if(this.getCurrentSet().length-1 > this.state.characterIndex) {
      this.setState({characterIndex: this.state.characterIndex+1})
    }
    else {
      this.getNewSet()
    }
    this.clearPoints()
  }



  handlePressIn = e => { //this happens before gesture
    const pointsCopy = JSON.parse(JSON.stringify(this.state.points))
    console.log("press", e)
    pointsCopy.push([{x:e.nativeEvent.locationX, y:e.nativeEvent.locationY}])
    this.setState({
      points: pointsCopy
    })
  }

  handleGesture = e => {
    const pointsCopy = JSON.parse(JSON.stringify(this.state.points))
    pointsCopy[pointsCopy.length-1].push({x:e.nativeEvent.x, y:e.nativeEvent.y})
    this.setState({
      points: pointsCopy
    })
  }

  clearPoints = () => this.setState({points: []})

  undoPoint = () => this.setState({points: this.state.points.slice(0, this.state.points.length-1)})



  // boldCurrentCharacter = (text, currentCharacter) => {
  //   const split = text.split(currentCharacter).map(str => <Text>{str}</Text>)
  //
  //   for(let i=0; i<split.length-1; ++i) {
  //     split.splice(i,0,<Text>{currentCharacter}</Text>)
  //     ++i
  //   }
  //
  //   return (
  //     <React.Fragment>
  //       {split.map(s => s)}
  //     </React.Fragment>
  //   )
  // }

  getCurrentCharacter = chineseSet => {
    if(chineseSet.length > this.state.characterIndex) { //if this index is valid
      const currentCharacter = chineseSet[this.state.characterIndex] //return the character
      if(this.strokes[currentCharacter]) { //if there are strokes for this character
        const scale = dimensions.window.width / 1000
        return (
          <G transform={"scale("+scale+","+scale+")"}>
            {this.strokes[currentCharacter].strokes.map((d,i) =>
              <Path key={i} d={d} fill="#777"></Path>
            )}
          </G>
        )
      }
      return (
        <SvgText //this is the character the user should be writing
          x={dimensions.window.width/2}
          y={dimensions.window.width/2}
          dy="30%"
          textAnchor="middle"
          fill="#777"
          fontSize={0.8*dimensions.window.width}>
          {currentCharacter}
        </SvgText>
      )
    }

    return "" //else return nothing
  }

  getSwitchButtonText = () => {
    if(this.props.settings.traditionalOrSimplified === "traditional") { //if this is traditional
      return "Simplified" //show switch to simplified
    }

    return "Traditional" //else show switch to traditional
  }

  getNextButton = chineseSet => {
    if(chineseSet.length-1 <= this.state.characterIndex) {
      return <Button title="Next Set >" onPress={this.getNewSet}/>
    }

    return <Button title="Next Character >" onPress={this.getNextCharacter}/>
  }


  render() {
    if(this.state.status === "done") {
      const currentSet = this.getCurrentSet()
      const chineseSet = currentSet[ FIELD_TO_PARSED_INDEX_MAP[this.props.settings.traditionalOrSimplified] ]
      const pinyin = currentSet[FIELD_TO_PARSED_INDEX_MAP.pinyinTone]
      const english = currentSet[FIELD_TO_PARSED_INDEX_MAP.english]

      return (
        <View style={styles.container}>
          <PanGestureHandler onGestureEvent={this.handleGesture}>
            <Svg width={dimensions.window.width} height={dimensions.window.width}>
              <Rect //this is a dummy background
                width={dimensions.window.width}
                height={dimensions.window.width}
                fill="#48C9B0"
              />
              {this.getCurrentCharacter(chineseSet)}
              <G>
                {this.state.points.map((array,i) => { //this renders the strokes that the user draws
                  if(array.length > 1) {
                    return (
                      <Path
                        key={i}
                        d={"M"+array.map(p => p.x+" "+p.y).join("L")}
                        stroke="white"
                        strokeWidth={strokeWidth}
                        strokeLinejoin="round"
                      />
                    )
                  }
                  else if(array.length > 0) {
                    return <Circle key={i} cx={array[0].x} cy={array[0].y} r={strokeWidth/2} fill="white"/>
                  }
                })}
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
                  onPress={this.clearPoints}
                  title="Clear"
                />
              </View>
              <View style={{width:"25%"}}>
                <Button
                  onPress={this.undoPoint}
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
