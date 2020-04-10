import React from 'react'
import loadLocalResource from 'react-native-local-resource';
import dictionary from './chineseOutput.txt'
import strokes from './strokesOutput.txt'

const DictionaryContext = React.createContext(null) //{ parsed:[], map:{} }
const StrokesContext = React.createContext(null) //{}

export default class Data extends React.Component {
  dictionary = null
  strokes = null

  constructor(props) {
    super(props);

    this.state = {
      status: 0
    };
  }

  componentDidMount() {
    this.loadDictionary()
    this.loadStrokes()
  }

  loadDictionary = async () => {
    this.dictionary = await loadLocalResource(dictionary).then(content => {
      return JSON.parse(content);
    });
    this.setState({status: this.state.status + 1})

    console.log("LOADED DICTIONARY")
  }

  loadStrokes = async () => {
    this.strokes = await loadLocalResource(strokes).then(content => {
      return JSON.parse(content);
    });
    this.setState({status: this.state.status + 1})
    console.log("LOADED STROKES")
  }


  render() {
    return (
      <DictionaryContext.Provider value={this.dictionary}>
        <StrokesContext.Provider value={this.strokes}>
          {this.props.children}
        </StrokesContext.Provider>
      </DictionaryContext.Provider>
    );
  }
}

export const withDictionary = Component => props => (
  <DictionaryContext.Consumer>
    {dictionary => <Component {...props} dictionary={dictionary}/>}
  </DictionaryContext.Consumer>
);

export const withStrokes = Component => props => (
  <StrokesContext.Consumer>
    {strokes => <Component {...props} strokes={strokes}/>}
  </StrokesContext.Consumer>
);
