import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, TouchableOpacity } from 'react-native';
import Svg, {
  Path,
  Circle,
  Ellipse,
  Rect,
  G,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { UzzaMood } from '../services/prayerPauseService';

interface UzzaCatProps {
  mood: UzzaMood;
  size?: number;
  onPress?: () => void;
}

export const UzzaCat: React.FC<UzzaCatProps> = ({ mood, size = 260, onPress }) => {
  const breatheAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Gentle breathing loop
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: mood === 'Collapsed' ? 3000 : mood === 'Thriving' ? 1400 : 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0,
          duration: mood === 'Collapsed' ? 3000 : mood === 'Thriving' ? 1400 : 2000,
          useNativeDriver: true,
        }),
      ])
    );
    breathing.start();
    return () => breathing.stop();
  }, [mood]);

  const handleTap = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.08,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) onPress();
  };

  const translateY = breatheAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, mood === 'Collapsed' ? -2 : -6],
  });

  const scaleY = breatheAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, mood === 'Collapsed' ? 1.02 : 1.03],
  });

  // Base cat coat colors (desert golden beige)
  const coatColor = '#E5A65E';
  const coatShadow = '#C6873F';
  const creamBelly = '#FBE7C6';
  const earInner = '#FFAAA6';
  const nosePink = '#FF758F';

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handleTap} style={styles.container}>
      <Animated.View
        style={[
          styles.animatedWrapper,
          {
            transform: [
              { translateY },
              { scaleY },
              { scale: bounceAnim },
            ],
          },
        ]}
      >
        <Svg width={size} height={size * 0.9} viewBox="0 0 280 250">
          <Defs>
            {/* Saddle gradient (traditional desert textile) */}
            <LinearGradient id="saddleGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#9E2A2B" />
              <Stop offset="0.5" stopColor="#D97706" />
              <Stop offset="1" stopColor="#7F1D1D" />
            </LinearGradient>
            <LinearGradient id="shadowGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="rgba(0,0,0,0.18)" />
              <Stop offset="1" stopColor="rgba(0,0,0,0.02)" />
            </LinearGradient>
          </Defs>

          {/* Ground shadow ellipse */}
          <Ellipse
            cx={mood === 'Collapsed' ? '140' : '135'}
            cy={mood === 'Collapsed' ? '222' : '224'}
            rx={mood === 'Collapsed' ? '105' : '95'}
            ry="14"
            fill="url(#shadowGrad)"
          />

          {mood === 'Collapsed' ? (
            /* COLLAPSED CAT STATE (Lying flat, exhausted/sleeping) */
            <G id="uzza-collapsed">
              {/* Tail flat */}
              <Path
                d="M 50 200 Q 25 210 20 220 Q 30 226 60 215"
                fill={coatColor}
                stroke={coatShadow}
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Body lying down */}
              <Ellipse
                cx="135"
                cy="195"
                rx="85"
                ry="36"
                fill={coatColor}
                stroke={coatShadow}
                strokeWidth="3.5"
              />

              {/* Desert Saddle Blanket over resting back */}
              <Path
                d="M 95 168 Q 135 162 175 168 L 180 200 Q 135 204 90 200 Z"
                fill="url(#saddleGrad)"
                stroke="#641718"
                strokeWidth="2.5"
              />
              {/* Saddle tassels */}
              <Path
                d="M 95 200 L 95 208 M 115 201 L 115 209 M 135 202 L 135 210 M 155 201 L 155 209 M 175 200 L 175 208"
                stroke="#FDE68A"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Front Paws stretched forward */}
              <Ellipse cx="215" cy="214" rx="20" ry="9" fill={creamBelly} stroke={coatShadow} strokeWidth="2.5" />
              <Ellipse cx="195" cy="216" rx="18" ry="8" fill={creamBelly} stroke={coatShadow} strokeWidth="2.5" />

              {/* Head resting low on paws */}
              <Circle
                cx="195"
                cy="176"
                r="36"
                fill={coatColor}
                stroke={coatShadow}
                strokeWidth="3.5"
              />

              {/* Left & Right Drooped Ears */}
              <Path
                d="M 172 148 L 152 142 L 170 162 Z"
                fill={coatColor}
                stroke={coatShadow}
                strokeWidth="3"
              />
              <Path d="M 168 149 L 158 145 L 168 159 Z" fill={earInner} />

              <Path
                d="M 218 148 L 238 142 L 220 162 Z"
                fill={coatColor}
                stroke={coatShadow}
                strokeWidth="3"
              />
              <Path d="M 222 149 L 232 145 L 222 159 Z" fill={earInner} />

              {/* Closed weary eyes (-- --) */}
              <Path d="M 180 178 Q 190 182 200 178" stroke="#374151" strokeWidth="3" strokeLinecap="round" fill="none" />
              <Path d="M 206 178 Q 216 182 226 178" stroke="#374151" strokeWidth="3" strokeLinecap="round" fill="none" />

              {/* Cute nose & tiny droop mouth */}
              <Path d="M 203 186 L 207 191 L 199 191 Z" fill={nosePink} />
              <Path d="M 203 192 L 203 196" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />

              {/* Floating sleep Zzz */}
              <SvgText x="238" y="145" fontSize="18" fontWeight="bold" fill="#9CA3AF">Z</SvgText>
              <SvgText x="252" y="130" fontSize="14" fontWeight="bold" fill="#D1D5DB">z</SvgText>
              <SvgText x="262" y="118" fontSize="11" fontWeight="bold" fill="#E5E7EB">z</SvgText>
            </G>
          ) : (
            /* ACTIVE CAT STATES (Standing/Sitting proud like Sabr in screenshot) */
            <G id="uzza-standing">
              {/* TAIL */}
              {mood === 'Thriving' && (
                <Path
                  d="M 75 160 Q 40 130 50 90 Q 60 70 75 80 Q 75 100 85 145 Z"
                  fill={coatColor}
                  stroke={coatShadow}
                  strokeWidth="3"
                />
              )}
              {mood === 'Content' && (
                <Path
                  d="M 75 160 Q 45 145 55 115 Q 65 105 75 125 Z"
                  fill={coatColor}
                  stroke={coatShadow}
                  strokeWidth="3"
                />
              )}
              {(mood === 'Tired' || mood === 'Struggling' || mood === 'Exhausted') && (
                <Path
                  d="M 75 170 Q 45 180 35 205 Q 45 215 70 190 Z"
                  fill={coatColor}
                  stroke={coatShadow}
                  strokeWidth="3"
                />
              )}

              {/* BACK LEGS */}
              <Path
                d="M 70 160 L 65 215 Q 65 224 78 224 Q 90 224 88 210 L 92 165 Z"
                fill={coatColor}
                stroke={coatShadow}
                strokeWidth="3"
              />
              <Ellipse cx="76" cy="221" rx="14" ry="6" fill={creamBelly} />

              <Path
                d="M 105 165 L 102 214 Q 102 224 114 224 Q 125 224 123 210 L 122 170 Z"
                fill={coatShadow}
                stroke={coatShadow}
                strokeWidth="2"
              />
              <Ellipse cx="112" cy="221" rx="12" ry="5" fill={creamBelly} />

              {/* CAT MAIN BODY */}
              <Path
                d="M 70 145 Q 70 100 135 100 Q 185 100 190 145 Q 190 185 145 195 Q 85 195 70 145 Z"
                fill={coatColor}
                stroke={coatShadow}
                strokeWidth="3.5"
              />

              {/* CREAM BELLY */}
              <Ellipse cx="145" cy="155" rx="36" ry="28" fill={creamBelly} />

              {/* FRONT LEGS */}
              <Path
                d="M 148 165 L 145 216 Q 145 224 158 224 Q 169 224 167 212 L 168 165 Z"
                fill={coatShadow}
                stroke={coatShadow}
                strokeWidth="2"
              />
              <Ellipse cx="156" cy="221" rx="13" ry="5" fill={creamBelly} />

              <Path
                d="M 172 165 L 170 216 Q 170 224 184 224 Q 195 224 193 212 L 190 165 Z"
                fill={coatColor}
                stroke={coatShadow}
                strokeWidth="3"
              />
              <Ellipse cx="182" cy="221" rx="14" ry="6" fill={creamBelly} />

              {/* DESERT SADDLE TEXTILE ON CAT'S BACK (matches camel in screenshot) */}
              <Path
                d="M 100 102 Q 135 98 165 102 L 170 148 Q 135 154 95 148 Z"
                fill="url(#saddleGrad)"
                stroke="#641718"
                strokeWidth="2.5"
              />
              {/* Pattern lines on saddle */}
              <Path d="M 102 114 Q 135 110 163 114" stroke="#FDE68A" strokeWidth="2.5" fill="none" />
              <Path d="M 98 126 Q 135 122 167 126" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4,4" fill="none" />
              <Path d="M 96 138 Q 135 134 169 138" stroke="#FDE68A" strokeWidth="2.5" fill="none" />
              {/* Saddle tassels */}
              <Path
                d="M 100 148 L 100 157 M 116 149 L 116 158 M 132 150 L 132 159 M 148 150 L 148 159 M 164 148 L 164 157"
                stroke="#FDE68A"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* CAT HEAD */}
              <Circle
                cx="195"
                cy="92"
                r="40"
                fill={coatColor}
                stroke={coatShadow}
                strokeWidth="3.5"
              />

              {/* EARS */}
              {mood === 'Struggling' || mood === 'Exhausted' ? (
                /* Drooped flat ears */
                <>
                  <Path d="M 172 65 L 145 66 L 168 85 Z" fill={coatColor} stroke={coatShadow} strokeWidth="3" />
                  <Path d="M 170 68 L 152 68 L 167 80 Z" fill={earInner} />

                  <Path d="M 218 65 L 245 66 L 222 85 Z" fill={coatColor} stroke={coatShadow} strokeWidth="3" />
                  <Path d="M 220 68 L 238 68 L 223 80 Z" fill={earInner} />
                </>
              ) : (
                /* Alert upright perky ears */
                <>
                  <Path d="M 166 75 L 160 38 L 188 58 Z" fill={coatColor} stroke={coatShadow} strokeWidth="3" />
                  <Path d="M 168 70 L 165 46 L 184 59 Z" fill={earInner} />

                  <Path d="M 224 75 L 230 38 L 202 58 Z" fill={coatColor} stroke={coatShadow} strokeWidth="3" />
                  <Path d="M 222 70 L 225 46 L 206 59 Z" fill={earInner} />
                </>
              )}

              {/* CHEEK BLUSH */}
              {(mood === 'Thriving' || mood === 'Content') && (
                <>
                  <Circle cx="174" cy="104" r="7" fill="rgba(255, 117, 143, 0.45)" />
                  <Circle cx="218" cy="104" r="7" fill="rgba(255, 117, 143, 0.45)" />
                </>
              )}

              {/* WHISKERS */}
              <Path d="M 162 100 L 140 96 M 162 105 L 138 107 M 162 110 L 142 116" stroke="#4B5563" strokeWidth="1.8" strokeLinecap="round" />
              <Path d="M 228 100 L 250 96 M 228 105 L 252 107 M 228 110 L 248 116" stroke="#4B5563" strokeWidth="1.8" strokeLinecap="round" />

              {/* NOSE */}
              <Path d="M 195 98 L 199 104 L 191 104 Z" fill={nosePink} />

              {/* EYES & MOUTH BY MOOD */}
              {mood === 'Thriving' && (
                <>
                  {/* Happy closed crescent eyes ^ ^ */}
                  <Path d="M 174 88 Q 183 77 190 88" stroke="#1F2937" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  <Path d="M 200 88 Q 207 77 216 88" stroke="#1F2937" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  {/* Big smile w */}
                  <Path d="M 191 106 Q 195 112 195 106 Q 195 112 199 106" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  {/* Little sparkles near head */}
                  <SvgText x="142" y="50" fontSize="16" fill="#F59E0B">✨</SvgText>
                  <SvgText x="235" y="55" fontSize="14" fill="#F59E0B">✨</SvgText>
                </>
              )}

              {mood === 'Content' && (
                <>
                  {/* Peaceful relaxed eyes */}
                  <Path d="M 176 89 Q 184 81 190 89" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <Path d="M 200 89 Q 206 81 214 89" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
                  {/* Gentle smile */}
                  <Path d="M 192 106 Q 195 110 198 106" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </>
              )}

              {mood === 'Tired' && (
                <>
                  {/* Droopy half-closed eyelids */}
                  <Circle cx="183" cy="88" r="6" fill="#1F2937" />
                  <Rect x="176" y="81" width="14" height="6" fill={coatColor} />
                  <Path d="M 176 87 L 190 87" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />

                  <Circle cx="207" cy="88" r="6" fill="#1F2937" />
                  <Rect x="200" y="81" width="14" height="6" fill={coatColor} />
                  <Path d="M 200 87 L 214 87" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Tiny mouth sigh */}
                  <Path d="M 193 107 L 197 107" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
                </>
              )}

              {mood === 'Struggling' && (
                <>
                  {/* Sad round pleading eyes */}
                  <Circle cx="183" cy="89" r="6" fill="#1F2937" />
                  <Circle cx="181" cy="87" r="2" fill="#FFFFFF" />
                  <Path d="M 176 80 Q 183 83 189 81" stroke="#374151" strokeWidth="2" strokeLinecap="round" fill="none" />

                  <Circle cx="207" cy="89" r="6" fill="#1F2937" />
                  <Circle cx="205" cy="87" r="2" fill="#FFFFFF" />
                  <Path d="M 201 81 Q 207 83 214 80" stroke="#374151" strokeWidth="2" strokeLinecap="round" fill="none" />

                  {/* Wobbly sad mouth */}
                  <Path d="M 192 108 Q 195 104 198 108" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </>
              )}

              {mood === 'Exhausted' && (
                <>
                  {/* Tired squinting eyes > < */}
                  <Path d="M 177 84 L 187 89 L 177 94" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <Path d="M 213 84 L 203 89 L 213 94" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  {/* Heavy sweat bead */}
                  <Path d="M 226 76 C 226 73 231 66 231 66 C 231 66 236 73 236 76 C 236 79 233 82 231 82 C 229 82 226 79 226 76 Z" fill="#60A5FA" />
                  {/* Downward sigh mouth */}
                  <Path d="M 192 109 Q 195 105 198 109" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </>
              )}
            </G>
          )}
        </Svg>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
