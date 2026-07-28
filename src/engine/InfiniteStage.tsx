import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Circle, Text, Group, Line } from 'react-konva';
import { useCanvasStore } from '../store/useCanvasStore';
import { NodeRenderer } from './NodeRenderer';
import type { FreehandNode, ShapeNode, StickyNode } from '../types/canvas';

export const InfiniteStage: React.FC = () => {
  const stageRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStrokeId, setCurrentStrokeId] = useState<string | null>(null);

  const {
    nodes,
    nodeIds,
    selectedIds,
    activeTool,
    zoom,
    pan,
    gridType,
    cursors,
    defaultStyles,
    currentUserName,
    currentUserColor,
    setZoom,
    setPan,
    setSelectedIds,
    addNode,
    updateNode,
  } = useCanvasStore();

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse wheel zoom centered on cursor coordinates
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = zoom;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - pan.x) / oldScale,
      y: (pointer.y - pan.y) / oldScale,
    };

    const zoomFactor = e.evt.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(10, Math.max(0.1, oldScale * zoomFactor));

    setZoom(newScale);
    setPan({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const handleMouseDown = (e: any) => {
    // If middle click or hand tool, enable panning
    if (e.evt.button === 1 || activeTool === 'hand') return;

    const stage = e.target.getStage();
    const pointer = stage.getRelativePointerPosition();

    if (activeTool === 'select') {
      // If clicked empty canvas, clear selection
      if (e.target === stage) {
        setSelectedIds([]);
      }
      return;
    }

    if (activeTool === 'freehand' || activeTool === 'highlighter') {
      setIsDrawing(true);
      const strokeId = `freehand-${Date.now()}`;
      setCurrentStrokeId(strokeId);
      
      const newStroke: FreehandNode = {
        id: strokeId,
        type: 'freehand',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: 0,
        opacity: activeTool === 'highlighter' ? 0.5 : 1,
        zIndex: nodeIds.length + 1,
        isLocked: false,
        points: [[pointer.x, pointer.y, 0.5]],
        smoothing: 0.5,
        fillColor: activeTool === 'highlighter' ? '#FDE047' : '#EC4899',
        fillOpacity: 1,
        strokeColor: activeTool === 'highlighter' ? '#FDE047' : '#EC4899',
        strokeWidth: activeTool === 'highlighter' ? 24 : 6,
        isHighlighter: activeTool === 'highlighter',
      };
      addNode(newStroke);
      return;
    }

    if (activeTool === 'rectangle' || activeTool === 'ellipse') {
      const newShape: ShapeNode = {
        id: `${activeTool}-${Date.now()}`,
        type: activeTool,
        x: pointer.x - 80,
        y: pointer.y - 50,
        width: 160,
        height: 100,
        rotation: 0,
        opacity: 1,
        zIndex: nodeIds.length + 1,
        isLocked: false,
        name: `${activeTool === 'rectangle' ? 'UI Box Container' : 'Circular Badge'}`,
        ...defaultStyles,
      };
      addNode(newShape);
      return;
    }

    if (activeTool === 'sticky') {
      const newSticky: StickyNode = {
        id: `sticky-${Date.now()}`,
        type: 'sticky',
        text: '🔥 New Idea:\nDouble-click to edit note discussion.',
        colorPreset: 'pink',
        author: currentUserName,
        x: pointer.x - 120,
        y: pointer.y - 120,
        width: 240,
        height: 240,
        rotation: (Math.random() - 0.5) * 6,
        opacity: 1,
        zIndex: nodeIds.length + 1,
        isLocked: false,
        ...defaultStyles,
      };
      addNode(newSticky);
      return;
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing || !currentStrokeId) return;
    const stage = e.target.getStage();
    const pointer = stage.getRelativePointerPosition();

    const currentStroke = nodes[currentStrokeId] as FreehandNode;
    if (currentStroke) {
      updateNode(currentStrokeId, {
        points: [...currentStroke.points, [pointer.x, pointer.y, 0.6]],
      });
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setCurrentStrokeId(null);
    }
  };

  // Render Background Grid lines based on pan and zoom coordinates
  const renderGrid = () => {
    if (gridType === 'none') return null;
    const gridSize = 40 * zoom;
    const offsetX = pan.x % gridSize;
    const offsetY = pan.y % gridSize;

    const lines = [];
    const width = dimensions.width;
    const height = dimensions.height;

    if (gridType === 'dot') {
      const dots = [];
      for (let x = offsetX; x < width; x += gridSize) {
        for (let y = offsetY; y < height; y += gridSize) {
          dots.push(
            <Circle key={`dot-${x}-${y}`} x={x} y={y} radius={1.2} fill="rgba(255, 255, 255, 0.15)" />
          );
        }
      }
      return dots;
    }

    // Blueprint grid lines
    for (let x = offsetX; x < width; x += gridSize) {
      lines.push(
        <Line key={`v-${x}`} points={[x, 0, x, height]} stroke="rgba(255, 255, 255, 0.05)" strokeWidth={1} />
      );
    }
    for (let y = offsetY; y < height; y += gridSize) {
      lines.push(
        <Line key={`h-${y}`} points={[0, y, width, y]} stroke="rgba(255, 255, 255, 0.05)" strokeWidth={1} />
      );
    }
    return lines;
  };

  return (
    <div style={{ width: '100vw', height: '100vh', cursor: activeTool === 'hand' ? 'grab' : 'default' }}>
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        draggable={activeTool === 'hand'}
        x={pan.x}
        y={pan.y}
        scaleX={zoom}
        scaleY={zoom}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDragEnd={(e) => {
          if (e.target === stageRef.current) {
            setPan({ x: e.target.x(), y: e.target.y() });
          }
        }}
      >
        {/* Layer 1: Interactive Grid Foundation */}
        <Layer x={-pan.x} y={-pan.y} scaleX={1} scaleY={1}>
          {renderGrid()}
        </Layer>

        {/* Layer 2: Core Canvas Nodes (Ordered by Z-Index) */}
        <Layer>
          {nodeIds.map((id) => {
            const node = nodes[id];
            if (!node) return null;
            return (
              <NodeRenderer
                key={id}
                node={node}
                isSelected={selectedIds.includes(id)}
                onSelect={(selectedId, e) => {
                  e.cancelBubble = true;
                  if (activeTool === 'select') {
                    setSelectedIds([selectedId]);
                  }
                }}
                onChange={(updatedId, updates) => updateNode(updatedId, updates)}
              />
            );
          })}
        </Layer>

        {/* Layer 3: Real-time Live Multiplayer Cursors */}
        <Layer>
          {Object.values(cursors).map((cursor) => (
            <Group key={cursor.userId} x={cursor.x} y={cursor.y}>
              {/* Collaborative Cursor Arrow SVG representation */}
              <Line
                points={[0, 0, 15, 12, 8, 14, 5, 22, 0, 0]}
                fill={cursor.color}
                stroke="#FFFFFF"
                strokeWidth={1}
                closed
              />
              {/* User Avatar Badge & Typing Status */}
              <Group x={16} y={16}>
                <Circle x={0} y={0} radius={4} fill={cursor.color} />
                <Text
                  x={8}
                  y={-6}
                  text={cursor.typingMessage ? `${cursor.userName}: "${cursor.typingMessage}"` : cursor.userName}
                  fontSize={12}
                  fontFamily="Inter"
                  fontWeight="600"
                  fill="#F8FAFC"
                  padding={6}
                />
              </Group>
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};
