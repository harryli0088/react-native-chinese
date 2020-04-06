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
    this.forEachGenerateKey(props.interpolateProps, (p,i,key) => {
      this.initAnimatedValue(p,i,key,props.interpolateProps[p].value)
    })
  }

  initAnimatedValue = (p,i,key,initialValue) => {
    this[key] = new Animated.Value(initialValue) //set the initial value to the prop

    this[key].addListener( (valueObject) => { //create a listener for this animated value
      this.myComponentRef.setNativeProps({ [p]: valueObject.value }) //use set native props to update the component
    });
  }

  forEachGenerateKey = (obj, forEachFunc) => {
    if(typeof obj === "object") {
      Object.keys(obj).forEach((p,i) => { //for each component prop
        const key = "_" + p //get the key

        forEachFunc(p,i,key) //run the for each function
      })
    }
  }





  componentDidUpdate(prevProps, prevState, snapshot) {
    this.forEachGenerateKey(this.props.animateProps, (p,i,key) => {
      if(prevProps.animateProps[p] !== this.props.animateProps[p]) { //if the values are different, we want to animate
        Animated[this.props.animationType]( this[key], { toValue: this.props.animateProps[p], ...this.props.animationOptions } ).start(); //start the animation
      }
    })
    this.forEachGenerateKey(this.props.interpolateProps, (p,i,key) => {
      if(prevProps.interpolateProps[p].value !== this.props.interpolateProps[p].value) { //if the values are different, we want to animate
        Animated[this.props.animationType]( this[key], { toValue: this.props.interpolateProps[p].value, ...this.props.animationOptions } ).start(); //start the animation
      }
    })
  }

  render() {
    const interpolatedProps = {}
    this.forEachGenerateKey(this.props.interpolateProps, (p,i,key) => {
      interpolatedProps[p] = this[key].interpolate({
        inputRange: this.props.interpolateProps[p].inputRange,
        outputRange: this.props.interpolateProps[p].outputRange
      });
    })

    console.log("interpolatedProps",interpolatedProps)

    console.log(<this.props.component
      ref={ ref => this.myComponentRef = ref }
      {...this.props.staticProps}
      {...this.props.animateProps}
      {...interpolatedProps}
    />)

    return(
      <this.props.component
        key={"test"}
        ref={ ref => this.myComponentRef = ref }
        {...this.props.staticProps}
        {...this.props.animateProps}
        {...interpolatedProps}
      />
    )
  }
}
