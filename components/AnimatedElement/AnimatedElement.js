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
  }

  constructor(props) {
    super(props);

    this.forEachGenerateKey(props.animateProps, (p,i,key) => {
      this.initAnimatedValue(p,i,key,props.animateProps[p])
    })
  }

  initAnimatedValue = (p,i,key,initialValue) => {
    this[key] = new Animated.Value(initialValue) //set the initial value to the prop

    this[key].addListener( (valueObject) => { //create a listener for this animated value
      this.myComponentRef.setNativeProps({ [p]: valueObject.value }) //use set native props to update the component
    });
  }

  forEachGenerateKey = (obj, forEachFunc) => {
    Object.keys(obj).forEach((p,i) => { //for each component prop
      const key = "_" + p //get the key

      forEachFunc(p,i,key) //run the for each function
    })
  }





  componentDidUpdate(prevProps, prevState, snapshot) {
    this.forEachGenerateKey(this.props.animateProps, (p,i,key) => {
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
