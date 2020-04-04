import React from 'react'
import { getAsyncStorage, setAsyncStorage } from '../../functions/asyncStorage';

const SettingsContext = React.createContext({settings: {}, setSetting: () => {}});

export default class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      traditionalOrSimplified: "traditional"
    };
  }

  componentDidMount() {
    this.getSettingsFromAsyncStorage()
  }

  getSettingsFromAsyncStorage = async () => {
    this.setState({
      traditionalOrSimplified: await getAsyncStorage('traditionalOrSimplified') === "traditional" ? "traditional" : "simplified",
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
