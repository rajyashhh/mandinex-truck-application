import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

interface LogoProps {
  size?: number;
  style?: any;
}

export default function Logo({ size = 40, style }: LogoProps) {
  const viewBox = `0 0 41 40`;
  
  return (
    <View style={[styles.container, { width: size, height: size * (40/41) }, style]}>
      <Svg
        width={size}
        height={size * (40/41)}
        viewBox={viewBox}
        fill="none"
      >
        <Defs>
          <LinearGradient
            id="paint0_linear_31_244"
            x1="41.8"
            y1="12"
            x2="-8.4"
            y2="30.5"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#8EF55A" />
            <Stop offset="1" stopColor="#214A50" />
          </LinearGradient>
        </Defs>
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20.4988 36.7422C21.8562 38.3712 23.2134 40 25.928 40C32.1768 40 33.9818 31.6888 33.9842 25.4312C33.9842 22.7168 35.613 21.3596 37.242 20.0024C38.871 18.6451 40.5 17.2879 40.5 14.5735C40.5 8.32278 32.1768 6.51548 25.9302 6.51548C23.2158 6.51548 21.8584 4.88662 20.5012 3.25774C19.1439 1.62887 17.7866 0 15.072 0C8.82096 0 7.01356 8.32278 7.01356 14.5689C7.01356 17.2833 5.38518 18.6405 3.75678 19.9977C2.12839 21.355 0.5 22.7122 0.5 25.4266C0.5 31.6772 8.82096 33.4846 15.0697 33.4846C17.7843 33.4846 19.1416 35.1134 20.4988 36.7422ZM20.5 27.4C24.587 27.4 27.9 24.087 27.9 20C27.9 15.9131 24.587 12.6 20.5 12.6C16.4131 12.6 13.1 15.9131 13.1 20C13.1 24.087 16.4131 27.4 20.5 27.4Z"
          fill="url(#paint0_linear_31_244)"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});