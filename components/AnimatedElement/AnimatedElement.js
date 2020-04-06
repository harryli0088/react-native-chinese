import React from 'react'
import PropTypes from 'prop-types'
import { Animated } from 'react-native';


export default class AnimatedElement extends React.Component {
  static propTypes = {
    component: PropTypes.func.isRequired,
    animateProps: PropTypes.object,
    interpolateProps: PropTypes.object,
    staticProps: PropTypes.object,
    animationType: PropTypes.oneOf(['spring', 'timing', 'decay']),
    animationOptions: PropTypes.object,
    animationOptions: PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.forEachComponentProp((p,i,key) => {
      this[key] = new Animated.Value(props.animateProps[p]) //set the initial value to the prop

      this[key].addListener( (valueObject) => { //create a listener for this animated value
        this.myComponentRef.setNativeProps({ [p]: valueObject.value }) //use set native props to update the component
      });
    })
  }

  forEachComponentProp = forEachFunc => {
    Object.keys(this.props.animateProps).forEach((p,i) => { //for each component prop
      const key = "_" + p //get the key

      forEachFunc(p,i,key) //run the for each function
    })
  }



  componentDidUpdate(prevProps, prevState, snapshot) {
    this.forEachComponentProp((p,i,key) => {
      if(prevProps.animateProps[p] !== this.props.animateProps[p]) { //if the values are different, we want to animate
        Animated[this.props.animationType]( this[key], { toValue: this.props.animateProps[p], ...this.props.animationOptions } ).start(); //start the animation
      }
    })
  }

  render() {
    return(
      <this.props.component ref={ ref => this.myComponentRef = ref } {...this.props.staticProps} {...this.props.animateProps}/>
    )
  }
}
