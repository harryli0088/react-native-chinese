import * as React from 'react';
import { Picker, StyleSheet, Text, View } from 'react-native';
import { withSettings, characterTermRestrictions } from "components/Settings/Settings"
import TabBarIcon from 'components/TabBarIcon'


const SettingsScreen = props => {
  return (
    <View style={styles.container}>
      <View style={{position:"relative"}}>
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

        <View style={{position:"absolute", top:25, right:10}}>
          <TabBarIcon name="md-arrow-dropup" size={30} style={{position:"absolute", top:0, right:0}}/>
          <TabBarIcon name="md-arrow-dropdown" size={30} style={{position:"absolute", top:15, right:0}}/>
        </View>
      </View>

      <View style={{position:"relative"}}>
        <Text>Restrict the Terms to:</Text>
        <Picker
          itemStyle={{height: 60}}
          selectedValue={props.settings.characterTermRestriction}
          onValueChange={(value, index) => props.setSetting("characterTermRestriction", value)}
        >
          {Object.keys(characterTermRestrictions).map(value =>
            <Picker.Item key={value} label={value} value={value}/>
          )}
        </Picker>

        <View style={{position:"absolute", top:25, right:10}}>
          <TabBarIcon name="md-arrow-dropup" size={30} style={{position:"absolute", top:0, right:0}}/>
          <TabBarIcon name="md-arrow-dropdown" size={30} style={{position:"absolute", top:15, right:0}}/>
        </View>
      </View>


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
