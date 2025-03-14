import React from 'react';
import DartBoardSection from './DartBoardSection';

// Die Standard-Dartscheiben-Segmentanordnung
const SEGMENTS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

interface DartBoardProps {
  onSectionClick?: (value: number, multiplier: number) => void;
  highlightedValue?: number;
  size?: number;
  interactive?: boolean;
}

const DartBoard: React.FC<DartBoardProps> = ({
  onSectionClick,
  highlightedValue,
  size = 400,
  interactive = false,
}) => {
  // Berechne Radiuswerte
  const outerBorderRadius = size / 2;
  const doubleOuterRadius = outerBorderRadius * 0.8;
  const doubleInnerRadius = doubleOuterRadius - size * 0.03;
  const singleOuterRadius = doubleInnerRadius - size * 0.008;
  const tripleOuterRadius = singleOuterRadius * 0.58;
  const tripleInnerRadius = tripleOuterRadius - size * 0.03;
  const singleInnerRadius = tripleInnerRadius - size * 0.008;
  const bullOuterRadius = size * 0.07;
  const bullInnerRadius = size * 0.025;
  
  // Handle section click
  const handleSectionClick = (segment: number, multiplier: number) => {
    if (interactive && onSectionClick) {
      onSectionClick(segment, multiplier);
    }
  };

  // Farben für Bulls Shark Pro Dartscheibe ohne Beschriftung
  const colors = {
    black: "#222222",
    cream: "#F0E6CC",      // Hellbeige/creme für die hellen Segmente
    red: "#E71C24",        // Kräftiges Rot für die Ringe
    green: "#008F42",      // Kräftiges Grün für die Ringe
    boardBg: "#222222",    // Schwarzer Rahmen
    wire: "#888888",       // Metalldrähte
    numberText: "#FFFFFF", // Weiße Zahlen
    highlightColor: "#FFCC00",
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-2xl">
      <defs>
        <filter id="boardShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="8" floodColor="#000000" floodOpacity="0.5" />
        </filter>
        
        {/* Texturgradient für cremefarbene Felder */}
        <linearGradient id="creamTexture" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0E6CC" />
          <stop offset="100%" stopColor="#E8DEBC" />
        </linearGradient>
        
        {/* Texturgradient für schwarze Felder */}
        <linearGradient id="blackTexture" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#222222" />
          <stop offset="100%" stopColor="#151515" />
        </linearGradient>
        
        {/* Gradienten für rote und grüne Ringe */}
        <linearGradient id="redRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF3333" />
          <stop offset="100%" stopColor="#CC0000" />
        </linearGradient>
        
        <linearGradient id="greenRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00AA55" />
          <stop offset="100%" stopColor="#007733" />
        </linearGradient>
      </defs>
      
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        {/* Schwarzer Rahmen */}
        <circle r={outerBorderRadius} fill={colors.boardBg} filter="url(#boardShadow)" />
        
        {/* Double-Ring */}
        {SEGMENTS.map((value, index) => (
          <DartBoardSection
            key={`double-${value}`}
            value={value}
            multiplier={2}
            segmentIndex={index}
            totalSegments={SEGMENTS.length}
            innerRadius={doubleInnerRadius}
            outerRadius={doubleOuterRadius}
            fill={index % 2 === 0 ? "url(#redRing)" : "url(#greenRing)"}
            stroke={colors.wire}
            strokeWidth={0.5}
            highlighted={highlightedValue === value * 2}
            highlightColor={colors.highlightColor}
            onClick={() => handleSectionClick(value, 2)}
            interactive={interactive}
          />
        ))}

        {/* Outer Single Area */}
        {SEGMENTS.map((value, index) => (
          <DartBoardSection
            key={`single-outer-${value}`}
            value={value}
            multiplier={1}
            segmentIndex={index}
            totalSegments={SEGMENTS.length}
            innerRadius={tripleOuterRadius}
            outerRadius={singleOuterRadius}
            fill={index % 2 === 0 ? "url(#blackTexture)" : "url(#creamTexture)"}
            stroke={colors.wire}
            strokeWidth={0.5}
            highlighted={highlightedValue === value}
            highlightColor={colors.highlightColor}
            onClick={() => handleSectionClick(value, 1)}
            interactive={interactive}
          />
        ))}

        {/* Triple-Ring */}
        {SEGMENTS.map((value, index) => (
          <DartBoardSection
            key={`triple-${value}`}
            value={value}
            multiplier={3}
            segmentIndex={index}
            totalSegments={SEGMENTS.length}
            innerRadius={tripleInnerRadius}
            outerRadius={tripleOuterRadius}
            fill={index % 2 === 0 ? "url(#redRing)" : "url(#greenRing)"}
            stroke={colors.wire}
            strokeWidth={0.5}
            highlighted={highlightedValue === value * 3}
            highlightColor={colors.highlightColor}
            onClick={() => handleSectionClick(value, 3)}
            interactive={interactive}
          />
        ))}

        {/* Inner Single Area */}
        {SEGMENTS.map((value, index) => (
          <DartBoardSection
            key={`single-inner-${value}`}
            value={value}
            multiplier={1}
            segmentIndex={index}
            totalSegments={SEGMENTS.length}
            innerRadius={singleInnerRadius}
            outerRadius={tripleInnerRadius}
            fill={index % 2 === 0 ? "url(#blackTexture)" : "url(#creamTexture)"}
            stroke={colors.wire}
            strokeWidth={0.5}
            highlighted={highlightedValue === value}
            highlightColor={colors.highlightColor}
            onClick={() => handleSectionClick(value, 1)}
            interactive={interactive}
          />
        ))}

        {/* Outer Bull (25) - Grüner Ring */}
        <circle
          r={bullOuterRadius}
          fill="url(#greenRing)"
          stroke={colors.wire}
          strokeWidth={0.5}
          onClick={() => interactive && onSectionClick && onSectionClick(25, 1)}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />

        {/* Inner Bull (50) - Roter Bullseye */}
        <circle
          r={bullInnerRadius}
          fill="url(#redRing)"
          stroke={colors.wire}
          strokeWidth={0.5}
          onClick={() => interactive && onSectionClick && onSectionClick(50, 1)}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />

        {/* Metalldrähte für die Abgrenzung der Sektoren */}
        {SEGMENTS.map((value, index) => {
          const angle = (index * 360) / SEGMENTS.length;
          const radians = (angle * Math.PI) / 180;
          const x = doubleOuterRadius * Math.cos(radians);
          const y = doubleOuterRadius * Math.sin(radians);
          
          return (
            <line
              key={`line-${value}`}
              x1={0}
              y1={0}
              x2={x}
              y2={y}
              stroke={colors.wire}
              strokeWidth={0.8}
            />
          );
        })}

        {/* Zahlen auf dem Rahmen */}
        {SEGMENTS.map((value, index) => {
          const angle = (index * 360) / SEGMENTS.length;
          const radians = (angle * Math.PI) / 180;
          const distance = outerBorderRadius * 0.9;
          const x = distance * Math.cos(radians);
          const y = distance * Math.sin(radians);
          
          return (
            <text
              key={`number-${value}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={colors.numberText}
              fontSize={size * 0.05}
              fontWeight="bold"
              fontFamily="Arial, sans-serif"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
            >
              {value}
            </text>
          );
        })}
        
        {/* Kleine dekorative Schrauben oder Nieten im Rahmen */}
        {[45, 135, 225, 315].map((angle, index) => {
          const radians = (angle * Math.PI) / 180;
          const x = outerBorderRadius * 0.92 * Math.cos(radians);
          const y = outerBorderRadius * 0.92 * Math.sin(radians);
          
          return (
            <circle
              key={`screw-${index}`}
              cx={x}
              cy={y}
              r={size * 0.01}
              fill="#444444"
              stroke="#222222"
              strokeWidth={0.5}
            />
          );
        })}
      </g>
    </svg>
  );
};

export default DartBoard;