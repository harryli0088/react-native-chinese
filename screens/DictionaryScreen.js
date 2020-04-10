import * as React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Fuse from 'fuse.js'
import { withSettings } from "components/Settings/Settings"

const options = {
  isCaseSensitive: false,
  findAllMatches: false,
  includeMatches: false,
  includeScore: false,
  useExtendedSearch: false,
  minMatchCharLength: 1,
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  keys: [],
};

const DictionaryScreen = props => {
  const [search, onChangeSearch] = React.useState('');

  return (
    <View style={styles.container}>
      <View style={{position:"relative"}}>
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
          onChangeText={text => onChangeSearch(text)}
          value={search}
          placerholder="Search..."
        />
        <Text
          style={{position:"absolute", top: "50%", right: 10, transform:[{translateY:-10}]}}
          onPress={e => onChangeSearch("")}
        >
          x
        </Text>
      </View>
    </View>
  );
}

export default withSettings(DictionaryScreen)


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
