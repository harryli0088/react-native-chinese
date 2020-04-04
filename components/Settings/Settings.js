import React from 'react'
import { getAsyncStorage, setAsyncStorage } from '../../functions/asyncStorage';

const withSettings = Component => {
  class WithSettings extends React.Component {
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

    setSettings = (key, value) => {
      console.log("set", key, value)
      this.setState({[key]:value})
      setAsyncStorage(key, value)
    }

    render() {
      return (
        <Component {...this.props} settings={this.state} setSetting={this.setSettings}/>
      );
    }
  }

  return WithSettings
};

export default withSettings
