import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { Button, Image, Platform, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import loadLocalResource from 'react-native-local-resource';
import { MonoText } from '../components/StyledText';
import TabBarIcon from '../components/TabBarIcon'; //<TabBarIcon focused={focused} name="md-book"/>
import withSettings from "../components/Settings/Settings"
import  {PanGestureHandler} from 'react-native-gesture-handler'

import chineseOutput from '../data/chineseOutput.txt'
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
    this.loadChinese()
  }

  loadChinese = async () => {
    this.chinese = await loadLocalResource(chineseOutput).then(content => {
      return JSON.parse(content);
    });
    this.getNewSet()
    this.setState({
      status: "done"
    })
  }

  getNewSet = () => {
    const newSetIndex = Math.floor(Math.random()*this.chinese.parsed.length)

    this.setState({
      setIndex: newSetIndex,
      characterIndex: 0,
    })
    this.clearPoints()
  }

  getCurrentSet = () => {
    if(this.chinese && this.chinese.parsed && this.chinese.parsed[this.state.setIndex]) {
      return this.chinese.parsed[this.state.setIndex]
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



  toggleTraditionalOrSimplified = () => {
    this.props.setSetting("traditionalOrSimplified", this.props.settings.traditionalOrSimplified==="traditional"?"simplified":"traditional")
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
      return chineseSet[this.state.characterIndex] //return the character
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
      const currentCharacter = this.getCurrentCharacter(chineseSet)

      return (
        <View style={styles.container}>
          <PanGestureHandler onGestureEvent={this.handleGesture}>
            <Svg width={dimensions.window.width} height={dimensions.window.width}>
              <Rect //this is a dummy background
                width={dimensions.window.width}
                height={dimensions.window.width}
                fill="#48C9B0"
              />
              <SvgText //this is the character the user should be writing
                x={dimensions.window.width/2}
                y={dimensions.window.width/2}
                dy="30%"
                textAnchor="middle"
                fill="#777"
                fontSize={0.8*dimensions.window.width}>
                {currentCharacter}
              </SvgText>
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

          <View>
            {this.getNextButton(chineseSet)}
            <Button
              onPress={this.clearPoints}
              title="Clear"
            />
            <Button
              onPress={this.undoPoint}
              title="Undo"
            />
            <Button
              onPress={this.toggleTraditionalOrSimplified}
              title={"Switch to " + this.getSwitchButtonText()}
            />
          </View>
        </View>
      );
    }

    return <Text>Loading...</Text>
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
  }
});
