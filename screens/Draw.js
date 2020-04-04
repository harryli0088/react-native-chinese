import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { Button, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { MonoText } from '../components/StyledText';

import  {PanGestureHandler} from 'react-native-gesture-handler'

import Svg, {
  Circle,
  G,
  Path,
  Line,
  Rect,
} from 'react-native-svg';



export default class DrawScreen extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      points: [[]]
    }
  }

  handlePressIn = e => { //this happens before gesture
    const pointsCopy = JSON.parse(JSON.stringify(this.state.points))
    pointsCopy.push([])
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

  render() {
    console.log(this.state.points.length)
    return (
      <View style={styles.container}>
        <Button
          onPress={() => {
            console.log('You tapped the button!');
          }}
          title="Press Me"
        />
        <Text style={{color:"black"}}>Test</Text>
          <PanGestureHandler onGestureEvent={this.handleGesture}>
            <Svg width="500" height="500" onPress={e => console.log(e)}>
              <Rect
                width={500}
                height={500}
                fill="blue"
                onPressIn={this.handlePressIn}
              />
              {this.state.points.map((array,i) =>
                array.length>0 ? <Path key={i} d={"M"+array.map(p => p.x+" "+p.y).join("L")} stroke="white" strokeWidth="5"/> : null
              )}
            </Svg>
          </PanGestureHandler>

        <View style={styles.tabBarInfoContainer}>
          <Text style={styles.tabBarInfoText}>This is a tab bar. You can edit it in:</Text>

          <View style={[styles.codeHighlightContainer, styles.navigationFilename]}>
            <MonoText style={styles.codeHighlightText}>navigation/BottomTabNavigator.js</MonoText>
          </View>
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
