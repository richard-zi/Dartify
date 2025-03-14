import React from 'react';

interface DartBoardSectionProps {
  value: number;
  multiplier: number;
  segmentIndex: number;
  totalSegments: number;
  innerRadius: number;
  outerRadius: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  textureId?: string;
  highlighted?: boolean;
  highlightColor?: string;
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
  stroke = "#333",
  strokeWidth = 0.5,
  textureId,
  highlighted = false,
  highlightColor = "#ffcc00",
  onClick,
  interactive = false,
}) => {
  // Winkel in Radianten berechnen
  const angleSize = (2 * Math.PI) / totalSegments;
  const startAngle = segmentIndex * angleSize - Math.PI / 2;
  const endAngle = startAngle + angleSize;

  // Punkte für den Pfad berechnen
  const startX1 = innerRadius * Math.cos(startAngle);
  const startY1 = innerRadius * Math.sin(startAngle);
  const startX2 = outerRadius * Math.cos(startAngle);
  const startY2 = outerRadius * Math.sin(startAngle);
  const endX1 = innerRadius * Math.cos(endAngle);
  const endY1 = innerRadius * Math.sin(endAngle);
  const endX2 = outerRadius * Math.cos(endAngle);
  const endY2 = outerRadius * Math.sin(endAngle);

  // Pfad für das Segment erstellen
  const largeArcFlag = angleSize > Math.PI ? 1 : 0;
  const path = [
    `M ${startX1} ${startY1}`,
    `L ${startX2} ${startY2}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endX2} ${endY2}`,
    `L ${endX1} ${endY1}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startX1} ${startY1}`,
    'Z',
  ].join(' ');

  // Tooltip-Text
  const tooltipText = `${value}${multiplier > 1 ? ` x${multiplier}` : ''}`;
  
  // Eindeutige ID für den Highlight-Gradient
  const highlightId = `highlight-${value}-${multiplier}-${segmentIndex}`;
  
  // Wenn textureId gesetzt ist, verwende diese anstelle der fill-Farbe
  const fillValue = textureId ? `url(#${textureId})` : fill;
  
  return (
    <g onClick={onClick} style={{ cursor: interactive ? 'pointer' : 'default' }}>
      {/* Highlight-Gradient für hervorgehobene Segmente */}
      {highlighted && (
        <defs>
          <linearGradient id={highlightId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={highlightColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={highlightColor} stopOpacity="0.4" />
          </linearGradient>
        </defs>
      )}
      
      {/* Haupt-Segment */}
      <path
        d={path}
        fill={highlighted ? `url(#${highlightId})` : fillValue}
        stroke={stroke}
        strokeWidth={strokeWidth}
      >
        {interactive && (
          <title>{tooltipText} = {value * multiplier}</title>
        )}
      </path>
    </g>
  );
};

export default DartBoardSection;