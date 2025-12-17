/**
 * @fileoverview Henteklar Logo-komponent
 * Jente med røde fletter og gule hårstrikker - brukes konsekvent i hele appen
 * @module components/Logo
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import Svg, { Circle, Path, G, Defs, LinearGradient, Stop, Ellipse } from 'react-native-svg';

/**
 * Hovedlogo - Jente med røde fletter (med valgfri bounce-animasjon)
 * Brukes på landingsside, loading-skjerm, og store visninger
 * 
 * @param {Object} props
 * @param {number} [props.size=120] - Størrelse i pixels
 * @param {boolean} [props.animated=false] - Om logoen skal ha bounce-animasjon
 * @param {Object} [props.style] - Ekstra styling
 */
export const Logo = ({ size = 120, animated = false, style }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -6,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated]);

  const svgContent = (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#5B7FFA" />
          <Stop offset="100%" stopColor="#4361EE" />
        </LinearGradient>
        <LinearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#E85A4F" />
          <Stop offset="50%" stopColor="#D64545" />
          <Stop offset="100%" stopColor="#C23A3A" />
        </LinearGradient>
        <LinearGradient id="faceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFEDDE" />
          <Stop offset="100%" stopColor="#FFE0C8" />
        </LinearGradient>
        <LinearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFD93D" />
          <Stop offset="100%" stopColor="#F5B800" />
        </LinearGradient>
      </Defs>

      {/* Bakgrunn */}
      <Circle cx="60" cy="60" r="56" fill="url(#bgGrad)" />
      <Circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

      {/* Venstre flette */}
      <G>
        <Ellipse cx="22" cy="52" rx="12" ry="18" fill="url(#hairGrad)" />
        <Ellipse cx="22" cy="52" rx="10" ry="15" fill="url(#hairGrad)" opacity="0.8" />
        <Circle cx="22" cy="34" r="6" fill="url(#ribbonGrad)" />
        <Circle cx="22" cy="34" r="4" fill="#FFE566" />
        <Path d="M18 38 Q14 45 16 52" stroke="#F5B800" strokeWidth="3" fill="none" strokeLinecap="round" />
        <Path d="M26 38 Q30 45 28 52" stroke="#F5B800" strokeWidth="3" fill="none" strokeLinecap="round" />
      </G>

      {/* Høyre flette */}
      <G>
        <Ellipse cx="98" cy="52" rx="12" ry="18" fill="url(#hairGrad)" />
        <Ellipse cx="98" cy="52" rx="10" ry="15" fill="url(#hairGrad)" opacity="0.8" />
        <Circle cx="98" cy="34" r="6" fill="url(#ribbonGrad)" />
        <Circle cx="98" cy="34" r="4" fill="#FFE566" />
        <Path d="M94 38 Q90 45 92 52" stroke="#F5B800" strokeWidth="3" fill="none" strokeLinecap="round" />
        <Path d="M102 38 Q106 45 104 52" stroke="#F5B800" strokeWidth="3" fill="none" strokeLinecap="round" />
      </G>

      {/* Hår topp/pannelugg */}
      <Path d="M32 48 Q35 22 60 18 Q85 22 88 48 Q82 35 60 30 Q38 35 32 48" fill="url(#hairGrad)" />
      <Path d="M32 48 Q28 55 32 68 L38 64 Q35 55 38 48 Z" fill="url(#hairGrad)" />
      <Path d="M88 48 Q92 55 88 68 L82 64 Q85 55 82 48 Z" fill="url(#hairGrad)" />

      {/* Ansikt */}
      <Circle cx="60" cy="60" r="26" fill="url(#faceGrad)" />
      <Ellipse cx="52" cy="52" rx="12" ry="8" fill="rgba(255,255,255,0.3)" />

      {/* Pannelugg detalj */}
      <Path d="M40 50 Q45 38 60 36 Q75 38 80 50 Q72 45 60 42 Q48 45 40 50" fill="url(#hairGrad)" />

      {/* Øyne */}
      <G>
        <Ellipse cx="50" cy="58" rx="7" ry="8" fill="white" />
        <Circle cx="50" cy="59" r="5" fill="#2D3748" />
        <Circle cx="50" cy="59" r="2.5" fill="#1A202C" />
        <Circle cx="52" cy="57" r="2" fill="white" />
        <Circle cx="48" cy="61" r="1" fill="white" opacity="0.5" />
        
        <Ellipse cx="70" cy="58" rx="7" ry="8" fill="white" />
        <Circle cx="70" cy="59" r="5" fill="#2D3748" />
        <Circle cx="70" cy="59" r="2.5" fill="#1A202C" />
        <Circle cx="72" cy="57" r="2" fill="white" />
        <Circle cx="68" cy="61" r="1" fill="white" opacity="0.5" />
      </G>

      {/* Øyenbryn */}
      <Path d="M44 50 Q50 48 54 50" stroke="#C23A3A" strokeWidth="2" fill="none" strokeLinecap="round" />
      <Path d="M66 50 Q70 48 76 50" stroke="#C23A3A" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Kinn (blush) */}
      <Ellipse cx="42" cy="68" rx="6" ry="4" fill="#FFB6B6" opacity="0.5" />
      <Ellipse cx="78" cy="68" rx="6" ry="4" fill="#FFB6B6" opacity="0.5" />

      {/* Nese */}
      <Path d="M60 62 L58 68 L62 68" fill="none" stroke="#E8C4B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Smil */}
      <Path d="M52 74 Q60 82 68 74" fill="none" stroke="#E85A4F" strokeWidth="3" strokeLinecap="round" />
      <Path d="M54 75 Q60 80 66 75" fill="white" opacity="0.8" />

      {/* Fregner */}
      <Circle cx="45" cy="64" r="1" fill="#E8A090" opacity="0.6" />
      <Circle cx="48" cy="66" r="1" fill="#E8A090" opacity="0.6" />
      <Circle cx="72" cy="64" r="1" fill="#E8A090" opacity="0.6" />
      <Circle cx="75" cy="66" r="1" fill="#E8A090" opacity="0.6" />
    </Svg>
  );

  if (animated) {
    return (
      <Animated.View style={[{ transform: [{ translateY: bounceAnim }] }, style]}>
        {svgContent}
      </Animated.View>
    );
  }

  return <View style={style}>{svgContent}</View>;
};

/**
 * Liten logo - Forenklet versjon for header, navigasjon, etc.
 * 
 * @param {Object} props
 * @param {number} [props.size=42] - Størrelse i pixels
 * @param {Object} [props.style] - Ekstra styling
 */
export const LogoSmall = ({ size = 42, style }) => (
  <View style={style}>
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id="bgGradSmall" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#5B7FFA" />
          <Stop offset="100%" stopColor="#4361EE" />
        </LinearGradient>
        <LinearGradient id="hairGradSmall" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#E85A4F" />
          <Stop offset="100%" stopColor="#C23A3A" />
        </LinearGradient>
      </Defs>
      
      {/* Bakgrunn */}
      <Circle cx="60" cy="60" r="56" fill="url(#bgGradSmall)" />
      
      {/* Venstre flette */}
      <Ellipse cx="22" cy="52" rx="10" ry="16" fill="url(#hairGradSmall)" />
      <Circle cx="22" cy="36" r="5" fill="#FFD93D" />
      
      {/* Høyre flette */}
      <Ellipse cx="98" cy="52" rx="10" ry="16" fill="url(#hairGradSmall)" />
      <Circle cx="98" cy="36" r="5" fill="#FFD93D" />
      
      {/* Hår topp */}
      <Path d="M32 48 Q35 22 60 18 Q85 22 88 48 Q82 35 60 30 Q38 35 32 48" fill="url(#hairGradSmall)" />
      
      {/* Ansikt */}
      <Circle cx="60" cy="60" r="26" fill="#FFEDDE" />
      
      {/* Pannelugg */}
      <Path d="M40 50 Q45 38 60 36 Q75 38 80 50 Q72 45 60 42 Q48 45 40 50" fill="url(#hairGradSmall)" />
      
      {/* Øyne */}
      <Circle cx="50" cy="59" r="4" fill="#2D3748" />
      <Circle cx="70" cy="59" r="4" fill="#2D3748" />
      <Circle cx="51.5" cy="57.5" r="1.5" fill="white" />
      <Circle cx="71.5" cy="57.5" r="1.5" fill="white" />
      
      {/* Smil */}
      <Path d="M52 74 Q60 82 68 74" fill="none" stroke="#E85A4F" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  </View>
);

/**
 * Logo uten bakgrunn - Kun jenta, for bruk på fargede bakgrunner
 * 
 * @param {Object} props
 * @param {number} [props.size=64] - Størrelse i pixels
 * @param {Object} [props.style] - Ekstra styling
 */
export const LogoIcon = ({ size = 64, style }) => (
  <View style={style}>
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id="hairGradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#E85A4F" />
          <Stop offset="100%" stopColor="#C23A3A" />
        </LinearGradient>
      </Defs>
      
      {/* Venstre flette */}
      <Ellipse cx="22" cy="52" rx="10" ry="16" fill="url(#hairGradIcon)" />
      <Circle cx="22" cy="36" r="5" fill="#FFD93D" />
      
      {/* Høyre flette */}
      <Ellipse cx="98" cy="52" rx="10" ry="16" fill="url(#hairGradIcon)" />
      <Circle cx="98" cy="36" r="5" fill="#FFD93D" />
      
      {/* Hår topp */}
      <Path d="M32 48 Q35 22 60 18 Q85 22 88 48 Q82 35 60 30 Q38 35 32 48" fill="url(#hairGradIcon)" />
      
      {/* Ansikt */}
      <Circle cx="60" cy="60" r="26" fill="#FFEDDE" />
      
      {/* Pannelugg */}
      <Path d="M40 50 Q45 38 60 36 Q75 38 80 50 Q72 45 60 42 Q48 45 40 50" fill="url(#hairGradIcon)" />
      
      {/* Øyne */}
      <Circle cx="50" cy="59" r="4" fill="#2D3748" />
      <Circle cx="70" cy="59" r="4" fill="#2D3748" />
      <Circle cx="51.5" cy="57.5" r="1.5" fill="white" />
      <Circle cx="71.5" cy="57.5" r="1.5" fill="white" />
      
      {/* Smil */}
      <Path d="M52 74 Q60 82 68 74" fill="none" stroke="#E85A4F" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  </View>
);

export default Logo;
