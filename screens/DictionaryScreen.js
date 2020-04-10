import * as React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Fuse from 'fuse.js'
import { withSettings } from "components/Settings/Settings"
import { withDictionary } from "data/Data"
import { FIELD_TO_PARSED_INDEX_MAP } from "screens/DrawScreen"
import TabBarIcon from 'components/TabBarIcon';

function getRegex(word) {
  const allowedSeparator = '\\\s,;"\'|';

  const regexStr = `(^.*[${allowedSeparator}]${word}$)|(^${word}[${allowedSeparator}].*)|(^${word}$)|(^.*[${allowedSeparator}]${word}[${allowedSeparator}].*$)`
  console.log("regexStr ", regexStr)
  return new RegExp(
    regexStr,
    'i', // Case insensitive
  );
}

class DictionaryScreen extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      search: "",
      results: [10050],
    }
  }

  render() {
    if(this.props.dictionary !== null) {
      return (
        <View style={styles.container}>
          <View style={{position:"relative"}}>
            <TextInput
              style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
              onChangeText={text => {
                this.setState({search: text})

                const regex = getRegex(text)
                const results = []
                this.props.dictionary.parsed.forEach((p,i) => {
                  if( regex.test(p[0]) ) { return results.push(i)}
                  if( regex.test(p[1]) ) { return results.push(i)}
                  if( regex.test(p[2]) ) { return results.push(i)}
                  if( regex.test(p[3]) ) { return results.push(i)}
                  p[4].forEach(e => {
                    if( regex.test(e) ) { return results.push(i)}
                  })
                })
                console.log("results.length",results.length)
                this.setState({results})
              }}
              value={this.state.search}
              placerholder="Search..."
            />
            <View
              style={{position:"absolute", top: "50%", right: 10, transform:[{translateY:-15}]}}
              onPress={e => onChangeSearch("")}
            >
              <TabBarIcon name="md-backspace"/>
            </View>
          </View>

          <ScrollView>
            {this.state.results.map((setIndex,i) =>
              <View key={i} style={styles.entry}>
                <Text style={styles.entryHeading}>
                  {this.props.dictionary.parsed[setIndex][ FIELD_TO_PARSED_INDEX_MAP[this.props.settings.traditionalOrSimplified] ]}
                  {this.props.dictionary.parsed[setIndex][FIELD_TO_PARSED_INDEX_MAP.pinyinTone]}
                </Text>

                <View>
                  {this.props.dictionary.parsed[setIndex][FIELD_TO_PARSED_INDEX_MAP.english].map((e,j) =>
                    <Text key={j}>{e}</Text>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
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

export default withSettings(
  withDictionary(DictionaryScreen)
)


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  entry: {
    padding: 2,
    borderBottomColor: "gray",
    borderWidth: 1,
  },
  entryHeading: {
    fontSize: 20,
  },
});
