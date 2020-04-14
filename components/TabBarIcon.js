import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import PropTypes from 'prop-types'

import Colors from '../constants/Colors';

export default function TabBarIcon(props) {
  return (
    <Ionicons
      name={props.name}
      size={props.size}
      style={props.style}
      color={props.focused ? Colors.tabIconSelected : Colors.tabIconDefault}
    />
  );
}

TabBarIcon.defaultProps = {
  size: 30,
  style: { marginBottom: -3 },
}

TabBarIcon.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
}
