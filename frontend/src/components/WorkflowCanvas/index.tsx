import React, { useCallback, useState, useRef } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import UserQueryNode from './nodes/UserQueryNode';
import KnowledgeBaseNode from './nodes/KnowledgeBaseNode';
import LLMEngineNode from './nodes/LLMEngineNode';
import OutputNode from './nodes/OutputNode';

const nodeTypes = {
  userQuery: UserQueryNode,
  knowledgeBase: KnowledgeBaseNode,
  llmEngine: LLMEngineNode,
  output: OutputNode,
};

interface WorkflowCanvasProps {
  onNodesChange?: (nodes: any[]) => void;
  onEdgesChange?: (edges: any[]) => void;
  onConnect?: (connection: any) => void;
  onInit?: (instance: any) => void;
  initialNodes?: any[];
  initialEdges?: any[];
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  onNodesChange,
  onEdgesChange,
  onConnect: onConnectProp,
  onInit,
  initialNodes = [],
  initialEdges = [],
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => {
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        type: 'smoothstep',
        animated: true,
      };
      setEdges((eds) => addEdge(newEdge, eds));
      if (onConnectProp) {
        onConnectProp(params);
      }
    },
    [setEdges, onConnectProp]
  );

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChangeInternal(changes);
      if (onNodesChange) {
        onNodesChange(nodes);
      }
    },
    [onNodesChangeInternal, onNodesChange, nodes]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChangeInternal(changes);
      if (onEdgesChange) {
        onEdgesChange(edges);
      }
    },
    [onEdgesChangeInternal, onEdgesChange, edges]
  );

  const onInitCallback = useCallback(
    (instance: any) => {
      if (onInit) {
        onInit(instance);
      }
    },
    [onInit]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onInit={onInitCallback}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
