import React from 'react';
import DartBoardSection from './DartBoardSection';

// The standard dartboard segments arrangement
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
  // Calculate radius values
  const doubleOuterRadius = size / 2;
  const doubleInnerRadius = doubleOuterRadius - size * 0.02;
  const singleOuterRadius = doubleInnerRadius - size * 0.01;
  const tripleOuterRadius = singleOuterRadius * 0.6;
  const tripleInnerRadius = tripleOuterRadius - size * 0.02;
  const singleInnerRadius = tripleInnerRadius - size * 0.01;
  const bullOuterRadius = size * 0.07;
  const bullInnerRadius = size * 0.035;

  // Handle section click
  const handleSectionClick = (segment: number, multiplier: number) => {
    if (interactive && onSectionClick) {
      onSectionClick(segment, multiplier);
    }
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        {/* Background */}
        <circle r={doubleOuterRadius} fill="#222" />

        {/* Double ring */}
        {SEGMENTS.map((value, index) => (
          <DartBoardSection
            key={`double-${value}`}
            value={value}
            multiplier={2}
            segmentIndex={index}
            totalSegments={SEGMENTS.length}
            innerRadius={doubleInnerRadius}
            outerRadius={doubleOuterRadius}
            fill={value % 2 === 0 ? "#ff0000" : "#008000"}
            highlighted={highlightedValue === value * 2}
            onClick={() => handleSectionClick(value, 2)}
            interactive={interactive}
          />
        ))}

        {/* Outer single area */}
        {SEGMENTS.map((value, index) => (
          <DartBoardSection
            key={`single-outer-${value}`}
            value={value}
            multiplier={1}
            segmentIndex={index}
            totalSegments={SEGMENTS.length}
            innerRadius={tripleOuterRadius}
            outerRadius={singleOuterRadius}
            fill={value % 2 === 0 ? "#000000" : "#f5f5f5"}
            highlighted={highlightedValue === value}
            onClick={() => handleSectionClick(value, 1)}
            interactive={interactive}
          />
        ))}

        {/* Triple ring */}
        {SEGMENTS.map((value, index) => (
          <DartBoardSection
            key={`triple-${value}`}
            value={value}
            multiplier={3}
            segmentIndex={index}
            totalSegments={SEGMENTS.length}
            innerRadius={tripleInnerRadius}
            outerRadius={tripleOuterRadius}
            fill={value % 2 === 0 ? "#ff0000" : "#008000"}
            highlighted={highlightedValue === value * 3}
            onClick={() => handleSectionClick(value, 3)}
            interactive={interactive}
          />
        ))}

        {/* Inner single area */}
        {SEGMENTS.map((value, index) => (
          <DartBoardSection
            key={`single-inner-${value}`}
            value={value}
            multiplier={1}
            segmentIndex={index}
            totalSegments={SEGMENTS.length}
            innerRadius={singleInnerRadius}
            outerRadius={tripleInnerRadius}
            fill={value % 2 === 0 ? "#000000" : "#f5f5f5"}
            highlighted={highlightedValue === value}
            onClick={() => handleSectionClick(value, 1)}
            interactive={interactive}
          />
        ))}

        {/* Outer bull (25) */}
        <circle
          r={bullOuterRadius}
          fill="#008000"
          stroke="none"
          onClick={() => handleSectionClick(25, 1)}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />

        {/* Inner bull (50) */}
        <circle
          r={bullInnerRadius}
          fill="#ff0000"
          stroke="none"
          onClick={() => handleSectionClick(50, 1)}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />

        {/* Section numbers */}
        {SEGMENTS.map((value, index) => {
          const angle = (index * 360) / SEGMENTS.length - 90;
          const radians = (angle * Math.PI) / 180;
          const x = (doubleOuterRadius + 20) * Math.cos(radians);
          const y = (doubleOuterRadius + 20) * Math.sin(radians);

          return (
            <text
              key={`number-${value}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize={size * 0.05}
              fontWeight="bold"
            >
              {value}
            </text>
          );
        })}
      </g>
    </svg>
  );
};

export default DartBoard;