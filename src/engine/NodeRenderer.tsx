import React from 'react';
import { Rect, Ellipse, Text, Group, Path, Line } from 'react-konva';
import { CanvasNode, FreehandNode, StickyNode, ArrowNode, ArtboardNode } from '../types/canvas';
import getStroke from 'perfect-freehand';

interface NodeRendererProps {
  node: CanvasNode;
  isSelected: boolean;
  onSelect: (id: string, e: any) => void;
  onChange: (id: string, newProps: Partial<CanvasNode>) => void;
}

// Helper to convert perfect-freehand points array into SVG path data string
function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) return '';
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      return `${acc} ${x0},${y0} ${0.5 * (x0 + x1)},${0.5 * (y0 + y1)}`;
    },
    `M ${stroke[0][0]},${stroke[0][1]} Q`
  );
  return `${d} Z`;
}

export const NodeRenderer: React.FC<NodeRendererProps> = ({ node, isSelected, onSelect, onChange }) => {
  const handleDragEnd = (e: any) => {
    onChange(node.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const selectionStroke = isSelected ? '#6366F1' : node.strokeColor || 'transparent';
  const selectionWidth = isSelected ? Math.max(2, (node.strokeWidth || 1) + 1) : node.strokeWidth || 0;

  switch (node.type) {
    case 'artboard': {
      const artboard = node as ArtboardNode;
      return (
        <Group
          x={node.x}
          y={node.y}
          draggable={!node.isLocked}
          onClick={(e) => onSelect(node.id, e)}
          onTap={(e) => onSelect(node.id, e)}
          onDragEnd={handleDragEnd}
        >
          {/* Device Artboard Label Above Frame */}
          <Text
            text={`📱 ${artboard.deviceLabel || 'Artboard Frame'}`}
            y={-24}
            fontSize={14}
            fontFamily="Outfit"
            fontWeight="600"
            fill="#94A3B8"
          />
          {/* Main Frame Container */}
          <Rect
            width={node.width}
            height={node.height}
            fill={node.fillColor || '#1A1E29'}
            opacity={node.opacity}
            stroke={isSelected ? '#38BDF8' : '#334155'}
            strokeWidth={isSelected ? 2.5 : 1.5}
            cornerRadius={node.cornerRadius || 32}
            shadowColor={node.shadowColor || 'rgba(0, 0, 0, 0.6)'}
            shadowBlur={node.shadowBlur || 30}
            shadowOffsetY={node.shadowOffsetY || 15}
          />
        </Group>
      );
    }

    case 'rectangle': {
      return (
        <Group
          x={node.x}
          y={node.y}
          draggable={!node.isLocked}
          onClick={(e) => onSelect(node.id, e)}
          onTap={(e) => onSelect(node.id, e)}
          onDragEnd={handleDragEnd}
        >
          <Rect
            width={node.width}
            height={node.height}
            fill={node.fillColor}
            opacity={node.opacity * (node.fillOpacity ?? 1)}
            stroke={selectionStroke}
            strokeWidth={selectionWidth}
            cornerRadius={node.cornerRadius || 0}
            shadowColor={node.shadowColor || 'transparent'}
            shadowBlur={node.shadowBlur || 0}
            shadowOffsetY={node.shadowOffsetY || 0}
          />
          {node.name && (
            <Text
              text={node.name}
              x={16}
              y={node.height / 2 - 8}
              width={node.width - 32}
              align="center"
              fontSize={15}
              fontFamily="Inter"
              fontWeight="600"
              fill="#FFFFFF"
            />
          )}
        </Group>
      );
    }

    case 'ellipse': {
      return (
        <Group
          x={node.x}
          y={node.y}
          draggable={!node.isLocked}
          onClick={(e) => onSelect(node.id, e)}
          onTap={(e) => onSelect(node.id, e)}
          onDragEnd={handleDragEnd}
        >
          <Ellipse
            radiusX={node.width / 2}
            radiusY={node.height / 2}
            fill={node.fillColor}
            opacity={node.opacity * (node.fillOpacity ?? 1)}
            stroke={selectionStroke}
            strokeWidth={selectionWidth}
            shadowColor={node.shadowColor || 'transparent'}
            shadowBlur={node.shadowBlur || 0}
          />
        </Group>
      );
    }

    case 'sticky': {
      const sticky = node as StickyNode;
      const colorMap = {
        yellow: '#FCD34D',
        pink: '#F472B6',
        cyan: '#22D3EE',
        purple: '#C084FC',
        emerald: '#34D399',
      };
      const bgColor = colorMap[sticky.colorPreset || 'yellow'] || '#FCD34D';

      return (
        <Group
          x={node.x}
          y={node.y}
          rotation={node.rotation}
          draggable={!node.isLocked}
          onClick={(e) => onSelect(node.id, e)}
          onTap={(e) => onSelect(node.id, e)}
          onDragEnd={handleDragEnd}
        >
          {/* Sticky Post-it Body with Drop Shadow */}
          <Rect
            width={node.width}
            height={node.height}
            fill={bgColor}
            cornerRadius={12}
            stroke={isSelected ? '#FFFFFF' : 'rgba(0,0,0,0.1)'}
            strokeWidth={isSelected ? 3 : 1}
            shadowColor="rgba(0, 0, 0, 0.45)"
            shadowBlur={20}
            shadowOffsetY={10}
            shadowOffsetX={-4}
          />
          {/* Content Text */}
          <Text
            x={20}
            y={24}
            width={node.width - 40}
            text={sticky.text}
            fontSize={18}
            fontFamily="Inter"
            fontWeight="600"
            fill="#0F172A"
            lineHeight={1.4}
          />
          {/* Author Tag */}
          <Text
            x={20}
            y={node.height - 35}
            text={`👤 ${sticky.author || 'Team Member'}`}
            fontSize={12}
            fontFamily="JetBrains Mono"
            fill="rgba(15, 23, 42, 0.65)"
          />
        </Group>
      );
    }

    case 'freehand': {
      const freehand = node as FreehandNode;
      const strokePoints = getStroke(freehand.points || [], {
        size: freehand.strokeWidth || 8,
        thinning: 0.6,
        smoothing: 0.5,
        streamline: 0.5,
      });
      const pathData = getSvgPathFromStroke(strokePoints);

      return (
        <Group
          x={node.x}
          y={node.y}
          draggable={!node.isLocked}
          onClick={(e) => onSelect(node.id, e)}
          onTap={(e) => onSelect(node.id, e)}
          onDragEnd={handleDragEnd}
        >
          <Path
            data={pathData}
            fill={node.fillColor || node.strokeColor || '#EC4899'}
            opacity={node.opacity}
            shadowColor={isSelected ? '#38BDF8' : 'transparent'}
            shadowBlur={isSelected ? 10 : 0}
          />
        </Group>
      );
    }

    case 'text': {
      return (
        <Group
          x={node.x}
          y={node.y}
          draggable={!node.isLocked}
          onClick={(e) => onSelect(node.id, e)}
          onTap={(e) => onSelect(node.id, e)}
          onDragEnd={handleDragEnd}
        >
          <Text
            text={node.text || ''}
            width={node.width}
            fontSize={(node as any).fontSize || 20}
            fontFamily={(node as any).fontFamily || 'Outfit'}
            fontWeight={(node as any).fontWeight || '600'}
            fill={node.fillColor || '#FFFFFF'}
            align={(node as any).textAlign || 'left'}
            stroke={isSelected ? 'rgba(99, 102, 241, 0.4)' : 'transparent'}
            strokeWidth={isSelected ? 1 : 0}
          />
        </Group>
      );
    }

    case 'arrow': {
      const arrow = node as ArrowNode;
      const start = arrow.startPoint || { x: 0, y: 0 };
      const end = arrow.endPoint || { x: 100, y: 50 };

      return (
        <Group
          onClick={(e) => onSelect(node.id, e)}
          onTap={(e) => onSelect(node.id, e)}
        >
          <Line
            points={[start.x, start.y, (start.x + end.x) / 2, start.y - 20, end.x, end.y]}
            stroke={node.strokeColor || '#06B6D4'}
            strokeWidth={node.strokeWidth || 3}
            dash={node.strokeDash}
            tension={0.4}
            shadowColor={isSelected ? '#FFFFFF' : 'transparent'}
            shadowBlur={isSelected ? 8 : 0}
          />
          {arrow.label && (
            <Text
              x={(start.x + end.x) / 2 - 60}
              y={(start.y + end.y) / 2 - 25}
              text={arrow.label}
              fontSize={13}
              fontFamily="JetBrains Mono"
              fill="#06B6D4"
              padding={4}
            />
          )}
        </Group>
      );
    }

    default:
      return null;
  }
};
