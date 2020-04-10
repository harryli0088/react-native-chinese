import React from 'react'
import PropTypes from 'prop-types'
import { G, Text } from 'react-native-svg';
import Stroke from 'components/Stroke/Stroke';
import * as d3 from 'd3'

class Character extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    if( //if there are strokes for this character
      this.props.strokesData &&
      this.props.strokesData.strokes &&
      this.props.strokesData.medians
    ) {
      const colorScale = d3.scaleLinear().domain([0, this.props.strokesData.strokes.length]).range(["red", "blue"])
      return ( //render via the stroke paths
        <G transform={"scale("+this.props.scale+","+this.props.scale+")"}>
          {this.props.strokesData.strokes.map((d,i) =>
            <Stroke
              key={i}

              color={colorScale(i)}
              d={d}
              duration={500}
              id={i.toString()}
              isFilled={this.props.currentStroke > i}
              medians={this.props.strokesData.medians[i]}
              showGuideDots={this.props.showGuideDots && this.props.currentStroke===i}
            />
          )}
        </G>
      )
    }

    return ( //else we do not have the strokes for this character, render via text
      <Text
        x={this.props.width/2}
        y={this.props.width/2}
        dy="30%"
        textAnchor="middle"
        fill="#777"
        fontSize={0.8*this.props.width}
        // style={{fontFamily:"space-mono"}}
        >
        {this.props.character}
      </Text>
    )
  }
}

Character.propTypes = {
  character: PropTypes.string.isRequired,
  currentStroke: PropTypes.number.isRequired,
  scale: PropTypes.number.isRequired,
  showGuideDots: PropTypes.bool.isRequired,
  strokesData: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
}

export default Character
