// SvgOmitter.js
import React from 'react';
import Svg, { Circle, Path, Text } from 'react-native-svg';
import { Animated } from 'react-native';

// Extend Circle and Path to omit the `collapsable` prop
class CircleOmitter extends Circle {
  render() {
    const newProps = {
      ...this.props,
      collapsable: undefined, // Remove collapsable
    };
    return <Circle {...newProps} />;
  }
}

class PathOmitter extends Path {
  render() {
    const newProps = {
      ...this.props,
      collapsable: undefined, // Remove collapsable
    };
    return <Path {...newProps} />;
  }
}

class TextOmitter extends Path {
  render() {
    const newProps = {
      ...this.props,
      collapsable: undefined, // Remove collapsable
    };
    return <Text {...newProps} />;
  }
}

// Create animated versions of the CircleOmitter and PathOmitter
const AnimatedCircle = Animated.createAnimatedComponent(CircleOmitter);
const AnimatedPath = Animated.createAnimatedComponent(PathOmitter);
const AnimatedText = Animated.createAnimatedComponent(TextOmitter);

export { AnimatedCircle, AnimatedPath, AnimatedText };
