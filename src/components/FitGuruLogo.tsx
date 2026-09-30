import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';
import { Colors } from '../theme/colors';

interface FitGuruLogoProps {
  size?: number;
  glow?: boolean;
  style?: ViewStyle;
}

/**
 * Modern, futuristic FitGuru Brand Logo.
 * Uses high-tech athletic geometry, multi-stop neon gradients, and ambient glow.
 * Completely immune to font missing 'box' glyph issues.
 */
export const FitGuruLogo: React.FC<FitGuruLogoProps> = ({
  size = 56,
  glow = true,
  style,
}) => {
  const outerSize = size * 1.25;

  return (
    <View style={[styles.container, style]}>
      {glow && (
        <View
          style={[
            styles.glowEffect,
            {
              width: outerSize,
              height: outerSize,
              borderRadius: outerSize / 2,
            },
          ]}
        />
      )}
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
      >
        <Defs>
          {/* Main neon emerald to electric cyan gradient */}
          <LinearGradient id="fgBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#10B981" />
            <Stop offset="50%" stopColor="#06B6D4" />
            <Stop offset="100%" stopColor="#3B82F6" />
          </LinearGradient>

          {/* Accent energetic gradient */}
          <LinearGradient id="fgAccentGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#34D399" />
            <Stop offset="100%" stopColor="#06B6D4" />
          </LinearGradient>

          {/* Badge background gradient */}
          <LinearGradient id="fgBadgeBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#1E293B" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#0F172A" stopOpacity="0.95" />
          </LinearGradient>
        </Defs>

        {/* Shield / Modern Hexagonal Contour */}
        <Path
          d="M50 6 L86 24 L86 64 L50 94 L14 64 L14 24 Z"
          fill="url(#fgBadgeBg)"
          stroke="url(#fgBrandGrad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Inner subtle geometric guide ring */}
        <Path
          d="M50 14 L80 29 L80 61 L50 86 L20 61 L20 29 Z"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Central Stylized Athletic Barbell + Lightning Geometry */}
        <G>
          {/* Central Barbell Shaft */}
          <Rect
            x="24"
            y="47"
            width="52"
            height="6"
            rx="3"
            fill="url(#fgAccentGrad)"
          />

          {/* Left Weight Plates - Angled Athletic Blocks */}
          <Rect
            x="32"
            y="30"
            width="4"
            height="40"
            rx="1.5"
            fill="url(#fgBrandGrad)"
          />
          <Rect
            x="26"
            y="36"
            width="3"
            height="28"
            rx="1.5"
            fill="#10B981"
          />
          <Rect
            x="21"
            y="42"
            width="2"
            height="16"
            rx="1"
            fill="#34D399"
          />

          {/* Right Weight Plates - Angled Athletic Blocks */}
          <Rect
            x="64"
            y="30"
            width="4"
            height="40"
            rx="1.5"
            fill="url(#fgBrandGrad)"
          />
          <Rect
            x="71"
            y="36"
            width="3"
            height="28"
            rx="1.5"
            fill="#06B6D4"
          />
          <Rect
            x="77"
            y="42"
            width="2"
            height="16"
            rx="1"
            fill="#38BDF8"
          />

          {/* Central Athletic "G" & Spark Core */}
          <Circle
            cx="50"
            cy="50"
            r="12"
            fill="#0B0F19"
            stroke="url(#fgBrandGrad)"
            strokeWidth="3"
          />

          {/* Dynamic AI Lightning Spark Core */}
          <Path
            d="M51 42 L46 50 L50 50 L48 58 L55 49 L51 49 Z"
            fill="#FACC15"
          />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    transform: [{ scale: 1.08 }],
    filter: 'blur(16px)',
  } as ViewStyle,
});
