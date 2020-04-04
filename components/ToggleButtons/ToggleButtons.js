import * as React from 'react';
import PropTypes from 'prop-types'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ToggleButtons = props => {
  return (
    <View style={styles.container}>
      {props.options.map((o,i) =>
        <TouchableOpacity
           key={i}
           style={[styles.button, o.value===props.value ? styles.buttonActive : null, {width: (100/props.options.length).toString()+"%"}]}
           onPress={e => props.onPress(e, o)}
           >
          <Text style={[styles.buttonText, o.value===props.value ? styles.buttonTextActive : null]}>{o.text}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

ToggleButtons.propTypes = {
  value: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  onPress: PropTypes.func.isRequired,
}

export default ToggleButtons

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    padding: 10,
    borderWidth: 1,
    borderColor: "gray"
  },
  buttonActive: {
    backgroundColor: "#148F77",
  },
  buttonText: {
    fontWeight: "bold",
    textAlign: "center",
    color: "gray"
  },
  buttonTextActive: {
    color: "white",
  }
});
