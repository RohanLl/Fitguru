import React from 'react';
import Svg, {
  Path,
  Circle,
  Rect,
  Polygon,
  G,
} from 'react-native-svg';
import { Colors } from '../theme/colors';

export type ModernIconName =
  | 'barbell'
  | 'settings'
  | 'settings-outline'
  | 'settings-sharp'
  | 'mail'
  | 'mail-outline'
  | 'lock'
  | 'lock-closed-outline'
  | 'eye'
  | 'eye-outline'
  | 'eye-off'
  | 'eye-off-outline'
  | 'arrow-forward'
  | 'arrow-back'
  | 'person'
  | 'person-outline'
  | 'flame'
  | 'flame-outline'
  | 'time'
  | 'time-outline'
  | 'timer'
  | 'timer-outline'
  | 'calendar'
  | 'calendar-outline'
  | 'restaurant'
  | 'restaurant-outline'
  | 'water'
  | 'checkmark'
  | 'checkmark-circle'
  | 'close'
  | 'play'
  | 'pause'
  | 'refresh'
  | 'refresh-circle'
  | 'add'
  | 'remove'
  | 'swap'
  | 'swap-horizontal'
  | 'sparkles'
  | 'bulb'
  | 'bulb-outline'
  | 'share'
  | 'share-outline'
  | 'leaf'
  | 'leaf-outline'
  | 'logout'
  | 'log-out-outline'
  | 'shield'
  | 'shield-checkmark'
  | 'cloud-upload'
  | 'cloud-upload-outline'
  | 'repeat'
  | 'repeat-outline'
  | 'fitness'
  | 'body-outline'
  | 'options-outline'
  | 'chevron-up'
  | 'chevron-down'
  | 'chevron-forward'
  | 'male'
  | 'female';

interface ModernIconProps {
  name: ModernIconName | string;
  size?: number;
  color?: string;
}

export const ModernIcon: React.FC<ModernIconProps> = ({
  name,
  size = 20,
  color = Colors.text,
}) => {
  const normName = name.replace('-outline', '').replace('-sharp', '');

  const renderIcon = () => {
    switch (normName) {
      case 'barbell':
      case 'fitness':
        return (
          <G stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12M2 12h4M18 12h4" />
          </G>
        );

      case 'settings':
      case 'options':
        return (
          <G stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Circle cx="12" cy="12" r="3" />
            <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </G>
        );

      case 'mail':
        return (
          <G stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Rect x="3" y="4" width="18" height="16" rx="2" />
            <Path d="M3 6l9 6 9-6" />
          </G>
        );

      case 'lock':
      case 'lock-closed':
        return (
          <G stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Rect x="4" y="11" width="16" height="10" rx="2" />
            <Path d="M7 11V7a5 5 0 0110 0v4" />
          </G>
        );

      case 'eye':
        return (
          <G stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <Circle cx="12" cy="12" r="3" />
          </G>
        );

      case 'eye-off':
        return (
          <G stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
          </G>
        );

      case 'sparkles':
        return (
          <Path
            d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6L12 2z"
            fill={color}
          />
        );

      case 'arrow-forward':
        return (
          <Path
            d="M5 12h14M12 5l7 7-7 7"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'arrow-back':
        return (
          <Path
            d="M19 12H5M12 19l-7-7 7-7"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'person':
      case 'body':
        return (
          <G stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Circle cx="12" cy="7" r="4" />
            <Path d="M20 21a8 8 0 00-16 0" />
          </G>
        );

      case 'flame':
        return (
          <Path
            d="M8.5 14.5A2.5 2.5 0 0011 17c1.38 0 2.5-1.12 2.5-2.5 0-1.63-1.04-2.8-1.74-3.59A5.82 5.82 0 0010.5 8c0 1.25-.8 2.27-2 2.27C7.67 10.27 7 9.6 7 8.5 7 5.5 10 2 12 2c0 2.5 3 4.5 3 7.5 0 .73-.13 1.43-.37 2.08.79.6 1.87 1.63 1.87 2.92a4.5 4.5 0 11-9 0c0-1.05.36-2.01.97-2.77.34.8.96 1.47 1.53 1.77z"
            fill={color}
          />
        );

      case 'time':
      case 'timer':
        return (
          <G stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Circle cx="12" cy="12" r="9" />
            <Path d="M12 7v5l3 2" />
          </G>
        );

      case 'calendar':
        return (
          <G stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Rect x="3" y="4" width="18" height="17" rx="2" />
            <Path d="M16 2v4M8 2v4M3 10h18" />
          </G>
        );

      case 'restaurant':
        return (
          <G stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M18 2v20M21 2h-6v5a3 3 0 003 3v12M3 2v7c0 1.66 1.34 3 3 3v10M6 2v7M9 2v7" />
          </G>
        );

      case 'water':
        return (
          <Path
            d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'checkmark':
        return (
          <Path
            d="M20 6L9 17l-5-5"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'checkmark-circle':
      case 'shield-checkmark':
        return (
          <G stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Circle cx="12" cy="12" r="10" />
            <Path d="M8 12l3 3 5-5" strokeWidth="2.2" />
          </G>
        );

      case 'close':
        return (
          <Path
            d="M18 6L6 18M6 6l12 12"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case 'play':
        return <Polygon points="6 4 20 12 6 20 6 4" fill={color} />;

      case 'pause':
        return (
          <G fill={color}>
            <Rect x="6" y="4" width="4" height="16" rx="1.5" />
            <Rect x="14" y="4" width="4" height="16" rx="1.5" />
          </G>
        );

      case 'refresh':
      case 'refresh-circle':
        return (
          <Path
            d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'add':
        return (
          <Path
            d="M12 5v14M5 12h14"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );

      case 'remove':
        return (
          <Path
            d="M5 12h14"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );

      case 'swap':
      case 'swap-horizontal':
        return (
          <Path
            d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'bulb':
        return (
          <G stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M9 18h6M10 22h4M12 2a7 7 0 00-7 7c0 2.5 1.5 4.5 2.5 6h9c1-1.5 2.5-3.5 2.5-6a7 7 0 00-7-7z" />
          </G>
        );

      case 'chevron-down':
        return (
          <Path
            d="M6 9l6 6 6-6"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'chevron-up':
        return (
          <Path
            d="M18 15l-6-6-6 6"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'chevron-forward':
        return (
          <Path
            d="M9 18l6-6-6-6"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'male':
        return (
          <G stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Circle cx="10" cy="14" r="5" />
            <Path d="M19 5l-5.4 5.4M19 5h-5M19 5v5" />
          </G>
        );

      case 'female':
        return (
          <G stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Circle cx="12" cy="9" r="5" />
            <Path d="M12 14v7M9 18h6" />
          </G>
        );

      case 'repeat':
        return (
          <Path
            d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'leaf':
        return (
          <Path
            d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'share':
        return (
          <G stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
          </G>
        );

      case 'logout':
      case 'log-out':
        return (
          <G stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </G>
        );

      case 'cloud-upload':
        return (
          <G stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M16 16l-4-4-4 4M12 12v9M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
          </G>
        );

      default:
        // Default clean athletic star indicator
        return (
          <Path
            d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6L12 2z"
            fill={color}
          />
        );
    }
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {renderIcon()}
    </Svg>
  );
};
