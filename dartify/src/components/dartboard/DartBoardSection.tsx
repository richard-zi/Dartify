import React from 'react';

interface DartBoardSectionProps {
  value: number;
  multiplier: number;
  segmentIndex: number;
  totalSegments: number;
  innerRadius: number;
  outerRadius: number;
  fill: string;
  highlighted?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}

const DartBoardSection: React.FC<DartBoardSectionProps> = ({
  value,
  multiplier,
  segmentIndex,
  totalSegments,
  innerRadius,
  outerRadius,
  fill,
  highlighted = false,
  onClick,
  interactive = false,
}) => {
  // Calculate angles in radians
  const angleSize = (2 * Math.PI) / totalSegments;
  const startAngle = segmentIndex * angleSize - Math.PI / 2;
  const endAngle = startAngle + angleSize;

  // Calculate points for the path
  const startX1 = innerRadius * Math.cos(startAngle);
  const startY1 = innerRadius * Math.sin(startAngle);
  const startX2 = outerRadius * Math.cos(startAngle);
  const startY2 = outerRadius * Math.sin(startAngle);
  const endX1 = innerRadius * Math.cos(endAngle);
  const endY1 = innerRadius * Math.sin(endAngle);
  const endX2 = outerRadius * Math.cos(endAngle);
  const endY2 = outerRadius * Math.sin(endAngle);

  // Create path for the section
  const largeArcFlag = angleSize > Math.PI ? 1 : 0;
  const path = [
    `M ${startX1} ${startY1}`,
    `L ${startX2} ${startY2}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endX2} ${endY2}`,
    `L ${endX1} ${endY1}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startX1} ${startY1}`,
    'Z',
  ].join(' ');

  // Add label for the section (only for debugging)
  const labelRadius = (innerRadius + outerRadius) / 2;
  const labelAngle = startAngle + angleSize / 2;
  const labelX = labelRadius * Math.cos(labelAngle);
  const labelY = labelRadius * Math.sin(labelAngle);
  
  // Tooltip text
  const tooltipText = `${value}${multiplier > 1 ? ` x${multiplier}` : ''}`;

  return (
    <g onClick={onClick} style={{ cursor: interactive ? 'pointer' : 'default' }}>
      <path
        d={path}
        fill={highlighted ? '#ffcc00' : fill}
        stroke="#333"
        strokeWidth={0.5}
      >
        {interactive && (
          <title>{tooltipText} = {value * multiplier}</title>
        )}
      </path>
      
      {/* Visible text for larger segments (not used in this implementation) */}
      {false && (
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize={10}
          style={{ pointerEvents: 'none' }}
        >
          {value * multiplier}
        </text>
      )}
    </g>
  );
};

export default DartBoardSection;