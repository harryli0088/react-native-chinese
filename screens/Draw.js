import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { Button, Image, Platform, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import loadLocalResource from 'react-native-local-resource';
import { MonoText } from '../components/StyledText';

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

export default class DrawScreen extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      status:"loading",
      points: [],
      setIndex: -1,
      characterIndex: 0,
      traditionalOrSimplified: 0
    }
  }

  componentDidMount() {
    this.loadChinese()
  }

  loadChinese = async () => {
    this.chinese = await loadLocalResource(chineseOutput).then(content => {
      return JSON.parse(content);
    });
    this.setState({
      status: "done"
    })
    this.getNewSet()
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
      return this.chinese.parsed[this.state.setIndex][this.state.traditionalOrSimplified]
    }
    return ""
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

  getCurrentCharacter = (currentSet) => {
    if(currentSet.length > this.state.characterIndex) {
      return currentSet[this.state.characterIndex]
    }

    return ""
  }

  toggleTraditionalOrSimplified = () => {
    this.setState({
      traditionalOrSimplified: this.state.traditionalOrSimplified===1 ? 0 : 1
    })
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


  getText = (currentSet) => {
    if(this.state.status === "loading") {
      return "Loading..."
    }

    return "You are writing the set " + currentSet
  }


  render() {
    const currentSet = this.getCurrentSet()

    return (
      <View style={styles.container}>
        <Button
          onPress={this.clearPoints}
          title="Clear"
        />
        <View>
          <Text>{this.getText(currentSet)}</Text>
        </View>
        <PanGestureHandler onGestureEvent={this.handleGesture}>
          <Svg width={dimensions.window.width} height={dimensions.window.width}>
            <Rect //this is a dummy background
              width={dimensions.window.width}
              height={dimensions.window.width}
              fill="blue"
            />
            <SvgText //this is the character the user should be writing
              x={dimensions.window.width/2}
              y={dimensions.window.width/2}
              dy="35%"
              textAnchor="middle"
              fill="#777"
              fontSize={dimensions.window.width}>
              {this.getCurrentCharacter(currentSet)}
            </SvgText>
            <G>
              {this.state.points.map((array,i) => { //this renders the strokes that the user draws
                if(array.length > 1) {
                  return <Path key={i} d={"M"+array.map(p => p.x+" "+p.y).join("L")} stroke="white" strokeWidth={strokeWidth}/>
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
          <Button title="Next Character" onPress={this.getNextCharacter}/>
          <Button title="Next Set" onPress={this.getNewSet}/>
        </View>
      </View>
    );
  }
}

DrawScreen.navigationOptions = {
  header: null,
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
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
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
