import * as React from 'react';
import { Picker, StyleSheet, Text, View } from 'react-native';
import { withSettings, characterTermRestrictions } from "components/Settings/Settings"


const SettingsScreen = props => {
  return (
    <View style={styles.container}>
      <View>
        <Text>Traditional or Simplified:</Text>
        <View>
          <Picker
            itemStyle={{height: 60}}
            selectedValue={props.settings.traditionalOrSimplified}
            onValueChange={(value, index) => props.setSetting("traditionalOrSimplified", value)}
          >
            <Picker.Item label="Traditional" value="traditional"/>
            <Picker.Item label="Simplified" value="simplified"/>
          </Picker>
        </View>
      </View>

      <View>
        <Text>Restrict the Terms to:</Text>
        <Picker
          itemStyle={{height: 60}}
          selectedValue={props.settings.characterTermRestriction}
          onValueChange={(value, index) => props.setSetting("characterTermRestriction", value)}
        >
          {Object.keys(characterTermRestrictions).map(value =>
            <Picker.Item label={value} value={value}/>
          )}
        </Picker>
      </View>

      {/* <Dropdown
        label='Restrict the words to'
        data={characterTermOptions}
        value={props.settings.characterTermRestriction}
        onChangeText={value => props.setSetting("characterTermRestriction", value)}
      /> */}
    </View>
  );
}

export default withSettings(SettingsScreen)


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
