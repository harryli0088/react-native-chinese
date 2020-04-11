import React from 'react'
import { getAsyncStorage, setAsyncStorage } from '../../functions/asyncStorage';

const SettingsContext = React.createContext({settings: {}, setSetting: () => {}});

export const characterSetRestrictions = {
  "Full Dictionary": [],
  "HSK1": ["1"],
  "HSK2 and below": ["1","2"],
  "HSK2 only": ["2"],
  "HSK3 and below": ["1","2","3"],
  "HSK3 only": ["3"],
  "HSK4 and below": ["1","2","3","4"],
  "HSK4 only": ["4"],
  "HSK5 and below": ["1","2","3","4","5"],
  "HSK5 only": ["5"],
  "HSK6 and below": ["1","2","3","4","5","6"],
  "HSK6 only": ["6"],
}

export default class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      traditionalOrSimplified: "traditional",
      characterSetRestriction: "Full Dictionary",
    };
  }

  componentDidMount() {
    this.getSettingsFromAsyncStorage()
  }

  getSettingsFromAsyncStorage = async () => {
    this.setState({
      traditionalOrSimplified: await getAsyncStorage('traditionalOrSimplified') === "traditional" ? "traditional" : "simplified",
      characterSetRestriction: await getAsyncStorage('characterSetRestriction') || this.state.characterSetRestriction,
    })
  }

  setSetting = (key, value) => {
    console.log("set", key, value)
    this.setState({[key]:value})
    setAsyncStorage(key, value)
  }

  render() {
    const value = {
      settings: this.state,
      setSetting: this.setSetting
    }

    return (
      <SettingsContext.Provider value={value}>
        {this.props.children}
      </SettingsContext.Provider>
    );
  }
}

export const withSettings = Component => props => (
  <SettingsContext.Consumer>
    {settingsContainer => <Component {...props} settings={settingsContainer.settings} setSetting={settingsContainer.setSetting}/>}
  </SettingsContext.Consumer>
);
