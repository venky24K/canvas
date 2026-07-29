import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Circle, Text, Group, Line, Rect } from 'react-konva';
import { useCanvasStore } from '../store/useCanvasStore';
import { NodeRenderer } from './NodeRenderer';
import type { FreehandNode, ShapeNode, StickyNode } from '../types/canvas';

export const InfiniteStage: React.FC = () => {
  const stageRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStrokeId, setCurrentStrokeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; endX: number; endY: number; visible: boolean } | null>(null);

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
    setZoom,
    setPan,
    setTool,
    setSelectedIds,
    addNode,
    updateNode,
    deleteSelected,
    boardTitle,
    currentUserId,
    registerThumbnailCapture,
  } = useCanvasStore();

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debounced background thumbnail capture (3s after last edit)
  useEffect(() => {
    const captureThumbnail = async () => {
      if (!stageRef.current) return;
      try {
        const dataUrl = stageRef.current.toDataURL({ pixelRatio: 0.5, mimeType: 'image/png' });
        const { GcpStorageService } = await import('../cloud/GcpStorageService');
        const { GcpFirestoreService } = await import('../cloud/GcpFirestoreService');
        const url = await GcpStorageService.uploadBoardThumbnail(dataUrl, boardTitle);
        if (url) {
          const currentNodes = useCanvasStore.getState().nodes;
          await GcpFirestoreService.saveBoardSnapshot(boardTitle, boardTitle, Object.values(currentNodes), currentUserId, url);
        }
      } catch (e) {
        console.warn('Failed to capture background thumbnail:', e);
      }
    };

    registerThumbnailCapture(captureThumbnail);
    
    const timeout = setTimeout(() => {
      // Only capture if there are nodes on the canvas
      if (Object.keys(nodes).length > 0) {
        captureThumbnail();
      }
    }, 3000);

    return () => {
      clearTimeout(timeout);
      registerThumbnailCapture(async () => {});
    };
  }, [boardTitle, currentUserId, nodes, registerThumbnailCapture]);

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
    const newScale = Math.min(5, Math.max(0.2, oldScale * zoomFactor));

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
      // If clicked empty canvas, clear selection and start selection box
      if (e.target === stage) {
        setSelectedIds([]);
        setSelectionBox({
          startX: pointer.x,
          startY: pointer.y,
          endX: pointer.x,
          endY: pointer.y,
          visible: true,
        });
      }
      return;
    }

    if (activeTool === 'freehand' || activeTool === 'highlighter') {
      setIsDrawing(true);
      const strokeId = `freehand-${Date.now()}`;
      setCurrentStrokeId(strokeId);
      
      const chosenWidth = defaultStyles.strokeWidth || 4;
      const chosenColor = defaultStyles.fillColor === '#EEF2FF' ? '#6366F1' : (defaultStyles.fillColor || '#6366F1');

      const newStroke: FreehandNode = {
        id: strokeId,
        type: 'freehand',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: 0,
        opacity: activeTool === 'highlighter' ? 0.45 : 1,
        zIndex: nodeIds.length + 1,
        isLocked: false,
        points: [[pointer.x, pointer.y, 0.5]],
        smoothing: 0.5,
        fillColor: chosenColor,
        fillOpacity: 1,
        strokeColor: chosenColor,
        strokeWidth: activeTool === 'highlighter' ? Math.max(20, chosenWidth * 2) : chosenWidth,
        isHighlighter: activeTool === 'highlighter',
      };
      addNode(newStroke);
      return;
    }

    if (activeTool === 'artboard') {
      if (e.target !== stage) return;
      const newArtboard: any = {
        id: `artboard-${Date.now()}`,
        type: 'artboard',
        deviceLabel: 'Desktop Frame (1440 × 900)',
        preset: 'macbook',
        clipChildren: false,
        x: pointer.x - 320,
        y: pointer.y - 200,
        width: 640,
        height: 400,
        rotation: 0,
        opacity: 1,
        zIndex: 0, // Frame background
        isLocked: false,
        fillColor: '#FFFFFF',
        strokeColor: '#CBD5E1',
        strokeWidth: 2,
        cornerRadius: 16,
      };
      addNode(newArtboard);
      setTool('select');
      return;
    }

    if (activeTool === 'text') {
      if (e.target !== stage) return;
      const newText: any = {
        id: `text-${Date.now()}`,
        type: 'text',
        text: '✨ Collaborative Text\nClick to select and edit styling.',
        fontSize: 24,
        fontFamily: 'Outfit',
        fontWeight: '700',
        textAlign: 'left',
        lineHeight: 1.3,
        x: pointer.x - 80,
        y: pointer.y - 20,
        width: 320,
        height: 80,
        rotation: 0,
        opacity: 1,
        zIndex: nodeIds.length + 1,
        isLocked: false,
        fillColor: defaultStyles.fillColor === '#EEF2FF' ? '#0F172A' : (defaultStyles.fillColor || '#0F172A'),
      };
      addNode(newText);
      setTool('select');
      return;
    }

    if (activeTool === 'arrow') {
      if (e.target !== stage) return;
      const newArrow: any = {
        id: `arrow-${Date.now()}`,
        type: 'arrow',
        x: 0,
        y: 0,
        width: 200,
        height: 100,
        rotation: 0,
        opacity: 1,
        zIndex: nodeIds.length + 1,
        isLocked: false,
        startPoint: { x: pointer.x - 120, y: pointer.y },
        endPoint: { x: pointer.x + 120, y: pointer.y - 40 },
        arrowType: 'curved',
        strokeColor: defaultStyles.fillColor === '#EEF2FF' ? '#0EA5E9' : (defaultStyles.fillColor || '#0EA5E9'),
        strokeWidth: Math.max(3, defaultStyles.strokeWidth || 4),
      };
      addNode(newArrow);
      setTool('select');
      return;
    }

    if (activeTool === 'rectangle' || activeTool === 'ellipse') {
      if (e.target !== stage) return;
      const newShape: ShapeNode = {
        id: `${activeTool}-${Date.now()}`,
        type: activeTool,
        x: pointer.x - 90,
        y: pointer.y - 60,
        width: 180,
        height: 120,
        rotation: 0,
        opacity: 1,
        zIndex: nodeIds.length + 1,
        isLocked: false,
        name: `${activeTool === 'rectangle' ? 'UI Box Container' : 'Circular Badge'}`,
        ...defaultStyles,
        strokeWidth: defaultStyles.strokeWidth || 4,
      };
      addNode(newShape);
      setTool('select');
      return;
    }

    if (activeTool === 'sticky') {
      if (e.target !== stage) return;
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
      setTool('select');
      return;
    }
  };

  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const pointer = stage.getRelativePointerPosition();

    if (selectionBox?.visible) {
      setSelectionBox({
        ...selectionBox,
        endX: pointer.x,
        endY: pointer.y,
      });
      return;
    }

    if (!isDrawing || !currentStrokeId) return;

    const currentStroke = nodes[currentStrokeId] as FreehandNode;
    if (currentStroke) {
      updateNode(currentStrokeId, {
        points: [...currentStroke.points, [pointer.x, pointer.y, 0.6]],
      });
    }
  };

  const handleMouseUp = () => {
    if (selectionBox?.visible) {
      const minX = Math.min(selectionBox.startX, selectionBox.endX);
      const maxX = Math.max(selectionBox.startX, selectionBox.endX);
      const minY = Math.min(selectionBox.startY, selectionBox.endY);
      const maxY = Math.max(selectionBox.startY, selectionBox.endY);

      // Only select if the box has a minimum size to avoid tiny accidental clicks
      if (maxX - minX > 5 && maxY - minY > 5) {
        const newSelectedIds = nodeIds.filter((id) => {
          const node = nodes[id];
          if (!node) return false;
          
          const nodeMinX = node.x;
          const nodeMaxX = node.x + (node.width || 0);
          const nodeMinY = node.y;
          const nodeMaxY = node.y + (node.height || 0);

          return (
            nodeMinX < maxX &&
            nodeMaxX > minX &&
            nodeMinY < maxY &&
            nodeMaxY > minY
          );
        });

        if (newSelectedIds.length > 0) {
          setSelectedIds(newSelectedIds);
        }
      }
      setSelectionBox(null);
      return;
    }

    if (isDrawing) {
      setIsDrawing(false);
      setCurrentStrokeId(null);
    }
  };

  // Generate Truly Infinite CSS Background Pattern (60fps performance without DOM Konva node overhead)
  const getInfiniteGridStyle = (): React.CSSProperties => {
    if (gridType === 'none') {
      return { backgroundColor: '#F8FAFC' };
    }

    // Smooth scaled grid dimensions proportional to zoom level (base 28px)
    const size = Math.max(8, Math.round(28 * zoom));

    if (gridType === 'dot') {
      return {
        backgroundColor: '#F8FAFC',
        backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.16) 1.3px, transparent 1.3px)',
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      };
    }

    // Line Blueprint Grid
    return {
      backgroundColor: '#F8FAFC',
      backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.06) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0, 0, 0, 0.06) 1px, transparent 1px)`,
      backgroundSize: `${size}px ${size}px`,
      backgroundPosition: `${pan.x}px ${pan.y}px`,
    };
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        cursor: activeTool === 'hand' ? 'grab' : 'default',
        ...getInfiniteGridStyle(),
      }}
    >
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
        onDragMove={(e) => {
          if (e.target === stageRef.current) {
            setPan({ x: e.target.x(), y: e.target.y() });
          }
        }}
        onDragEnd={(e) => {
          if (e.target === stageRef.current) {
            setPan({ x: e.target.x(), y: e.target.y() });
          }
        }}
      >
        {/* Layer 1: Core Canvas Nodes (Ordered by Z-Index) */}
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
                  if (activeTool === 'eraser') {
                    setSelectedIds([selectedId]);
                    deleteSelected();
                    return;
                  }
                  if (activeTool === 'select') {
                    setSelectedIds([selectedId]);
                  }
                }}
                isEditing={editingNodeId === id}
                onDoubleClick={(id) => setEditingNodeId(id)}
                onChange={(updatedId, updates) => updateNode(updatedId, updates)}
              />
            );
          })}
        </Layer>

        {/* Layer for Selection Box */}
        {selectionBox?.visible && (
          <Layer>
            <Rect
              x={Math.min(selectionBox.startX, selectionBox.endX)}
              y={Math.min(selectionBox.startY, selectionBox.endY)}
              width={Math.abs(selectionBox.endX - selectionBox.startX)}
              height={Math.abs(selectionBox.endY - selectionBox.startY)}
              fill="rgba(135, 137, 255, 0.15)"
              stroke="#8789FF"
              strokeWidth={1}
            />
          </Layer>
        )}

        {/* Layer 2: Real-time Live Multiplayer Cursors */}
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

      {/* HTML Overlay for Text Editing */}
      {editingNodeId && nodes[editingNodeId] && (nodes[editingNodeId].type === 'text' || nodes[editingNodeId].type === 'sticky') && (
        <textarea
          autoFocus
          defaultValue={nodes[editingNodeId].text || ''}
          onBlur={(e) => {
            updateNode(editingNodeId, { text: e.target.value });
            setEditingNodeId(null);
          }}
          onKeyDown={(e) => {
            // Cmd/Ctrl + Enter to save and exit edit mode
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.currentTarget.blur();
            }
          }}
          style={{
            position: 'absolute',
            top: nodes[editingNodeId].y * zoom + pan.y + (nodes[editingNodeId].type === 'sticky' ? 24 * zoom : 0),
            left: nodes[editingNodeId].x * zoom + pan.x + (nodes[editingNodeId].type === 'sticky' ? 24 * zoom : 0),
            width: (nodes[editingNodeId].width || 200) * zoom - (nodes[editingNodeId].type === 'sticky' ? 48 * zoom : 0),
            height: (nodes[editingNodeId].height || 100) * zoom - (nodes[editingNodeId].type === 'sticky' ? 48 * zoom : 0),
            fontSize: ((nodes[editingNodeId] as any).fontSize || 20) * zoom,
            fontFamily: (nodes[editingNodeId] as any).fontFamily || 'Outfit',
            fontWeight: (nodes[editingNodeId] as any).fontWeight || '600',
            color: nodes[editingNodeId].type === 'sticky' ? '#1E293B' : (nodes[editingNodeId].fillColor || '#FFF'),
            background: 'transparent',
            border: 'none',
            outline: '2px solid #8789FF',
            resize: 'none',
            overflow: 'hidden',
            zIndex: 1000,
            padding: 0,
            margin: 0,
            lineHeight: 1.3,
            transformOrigin: 'top left',
            // if sticky, account for rotation roughly or just set rotation
            transform: `rotate(${nodes[editingNodeId].rotation || 0}deg)`,
          }}
        />
      )}
    </div>
  );
};
