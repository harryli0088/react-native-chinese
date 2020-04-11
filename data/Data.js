import React from 'react'
import loadLocalResource from 'react-native-local-resource';
import dictionary from './chineseOutput.txt'
import strokes from './strokesOutput.txt'
import hsk1Vocab from './hsk/hsk1-vocab.txt'
import hsk1Characters from './hsk/hsk1-characters.txt'
import hsk2Vocab from './hsk/hsk2-vocab.txt'
import hsk2Characters from './hsk/hsk2-characters.txt'
import hsk3Vocab from './hsk/hsk3-vocab.txt'
import hsk3Characters from './hsk/hsk3-characters.txt'
import hsk4Vocab from './hsk/hsk4-vocab.txt'
import hsk4Characters from './hsk/hsk4-characters.txt'
import hsk5Vocab from './hsk/hsk5-vocab.txt'
import hsk5Characters from './hsk/hsk5-characters.txt'
import hsk6Vocab from './hsk/hsk6-vocab.txt'
import hsk6Characters from './hsk/hsk6-characters.txt'

const DictionaryContext = React.createContext(null) //{ parsed:[], map:{} }
const StrokesContext = React.createContext(null) //{}
const HskContext = React.createContext(null) //{1:{vocab:[],characters:[]}, 2:...}

export default class Data extends React.Component {
  dictionary = null
  strokes = null
  hsk = {1:{},2:{},3:{},4:{},5:{},6:{}}

  constructor(props) {
    super(props);

    this.state = {
      status: 0
    };
  }

  componentDidMount() {
    this.load(dictionary, "dictionary", content => this.dictionary=JSON.parse(content))
    this.load(strokes, "strokes", content => this.strokes=JSON.parse(content))
    this.load(hsk1Vocab, "hsk1Vocab", content => this.hsk["1"].vocab=content.trim().split("\n"))
    this.load(hsk1Characters, "hsk1Characters", content => this.hsk["1"].characters=content.trim().split("\n"))
    this.load(hsk2Vocab, "hsk2Vocab", content => this.hsk["2"].vocab=content.trim().split("\n"))
    this.load(hsk2Characters, "hsk2Characters", content => this.hsk["2"].characters=content.trim().split("\n"))
    this.load(hsk3Vocab, "hsk3Vocab", content => this.hsk["3"].vocab=content.trim().split("\n"))
    this.load(hsk3Characters, "hsk3Characters", content => this.hsk["3"].characters=content.trim().split("\n"))
    this.load(hsk4Vocab, "hsk4Vocab", content => this.hsk["4"].vocab=content.trim().split("\n"))
    this.load(hsk4Characters, "hsk4Characters", content => this.hsk["4"].characters=content.trim().split("\n"))
    this.load(hsk5Vocab, "hsk5Vocab", content => this.hsk["5"].vocab=content.trim().split("\n"))
    this.load(hsk5Characters, "hsk5Characters", content => this.hsk["5"].characters=content.trim().split("\n"))
    this.load(hsk6Vocab, "hsk6Vocab", content => this.hsk["6"].vocab=content.trim().split("\n"))
    this.load(hsk6Characters, "hsk6Characters", content => this.hsk["6"].characters=content.trim().split("\n"))
  }

  load = async (resource, name, callback) => {
    const content = await loadLocalResource(resource).then(content => content);
    callback(content)
    console.log("LOADED",name)
    this.setState({status: this.state.status + 1})
  }


  render() {
    return (
      <DictionaryContext.Provider value={this.dictionary}>
        <StrokesContext.Provider value={this.strokes}>
          <HskContext.Provider value={this.hsk}>
            {this.props.children}
          </HskContext.Provider>
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

export const withHsk = Component => props => (
  <HskContext.Consumer>
    {hsk => <Component {...props} hsk={hsk}/>}
  </HskContext.Consumer>
);
