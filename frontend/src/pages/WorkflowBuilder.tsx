import React, { useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlow, addEdge, Background, Controls } from '@xyflow/react';

import UserQueryNode from '../components/WorkflowCanvas/nodes/UserQueryNode';
import ComponentLibraryPanel from '../components/ComponentLibraryPanel';
import ComponentConfigPanel from '../components/ComponentConfigPanel';
import ExecutionControls from '../components/ExecutionControls';
import ChatInterface from '../components/ChatInterface';
import { stackApi, workflowApi, documentApi } from '../services/api';

// Custom node registration
const nodeTypes = {
  userQuery: UserQueryNode,
};

interface WorkflowBuilderProps {}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = () => {
  const { stackId } = useParams<{ stackId: string }>();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const reactFlowInstance = useRef<any | null>(null);

  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [stackName, setStackName] = useState('');

  // Load stack data on mount
  React.useEffect(() => {
    if (stackId) {
      loadStack();
    }
  }, [stackId]);

  const loadStack = async () => {
    try {
      const response = await stackApi.getStack(parseInt(stackId!));
      const stack = response.data;
      setStackName(stack.name);

      if (stack.workflow_config) {
        setNodes(stack.workflow_config.nodes || []);
        setEdges(stack.workflow_config.edges || []);
      }
    } catch (error) {
      console.error('Failed to load stack:', error);
    }
  };

  const handleDragStart = (event: React.DragEvent, component: any) => {
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify(component)
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const component = JSON.parse(
        event.dataTransfer.getData('application/reactflow')
      );

      if (reactFlowInstance.current) {
        const bounds = reactFlowWrapper.current!.getBoundingClientRect();
        const position = reactFlowInstance.current.screenToFlowPosition({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });

        const newNode = {
          id: `${component.type}-${Date.now()}`,
          type: component.type, // e.g. "userQuery"
          position,
          data: {
            label: component.label,
            config: getDefaultConfig(component.type),
          },
        };

        setNodes((nds) => [...nds, newNode]);
      }
    },
    [reactFlowInstance]
  );

  const getDefaultConfig = (type: string) => {
    switch (type) {
      case 'userQuery':
        return { placeholder: 'Write your query here.' };
      case 'knowledgeBase':
        return {
          embedding_model: 'openai',
          api_key: '',
          files: [],
        };
      case 'llmEngine':
        return {
          model: 'openai',
          api_key: '',
          prompt: 'You are a helpful AI assistant.',
          temperature: 0.7,
          use_web_search: false,
          serpapi_key: '',
        };
      case 'output':
        return { format: 'text' };
      default:
        return {};
    }
  };

  const handleNodesChange = useCallback((changes: any) => {
    setNodes((nds) => {
      const newNodes = nds.map((node) => {
        const change = changes.find((c: any) => c.id === node.id);
        if (change) {
          if (change.type === 'select') {
            setSelectedNode(change.selected ? node : null);
          }
          return { ...node, ...change };
        }
        return node;
      });
      return newNodes;
    });
  }, []);

  const handleEdgesChange = useCallback((changes: any) => {
    setEdges((eds) => {
      const newEdges = eds.map((edge) => {
        const change = changes.find((c: any) => c.id === edge.id);
        if (change) {
          return { ...edge, ...change };
        }
        return edge;
      });
      return newEdges;
    });
  }, []);

  const handleConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const handleInit = useCallback((instance: any) => {
    reactFlowInstance.current = instance;
  }, []);

  const handleUpdateNode = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === nodeId ? { ...node, data } : node))
    );
  }, []);

  const handleUploadFile = async (file: File) => {
    try {
      const response = await documentApi.uploadDocument(
        file,
        stackId ? parseInt(stackId) : undefined
      );
      console.log('File uploaded:', response.data);

      const kbNode = nodes.find((node) => node.type === 'knowledgeBase');
      if (kbNode) {
        const updatedFiles = [...(kbNode.data.config?.files || []), file.name];
        handleUpdateNode(kbNode.id, {
          ...kbNode.data,
          config: {
            ...kbNode.data.config,
            files: updatedFiles,
          },
        });
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  const validateWorkflow = async () => {
    try {
      const workflowConfig = { nodes, edges };
      const response = await workflowApi.validateWorkflow(workflowConfig);

      setIsValid(response.data.valid);
      setValidationErrors(response.data.errors || []);

      return response.data.valid;
    } catch (error) {
      console.error('Validation failed:', error);
      setIsValid(false);
      setValidationErrors(['Validation failed']);
      return false;
    }
  };

  const handleBuildStack = async () => {
    setIsBuilding(true);
    try {
      const isValidWorkflow = await validateWorkflow();
      if (isValidWorkflow) {
        console.log('Workflow is valid and ready for execution');
      }
    } catch (error) {
      console.error('Build failed:', error);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleSaveStack = async () => {
    if (!stackId) return;

    setIsSaving(true);
    try {
      const workflowConfig = { nodes, edges };
      await stackApi.updateStack(parseInt(stackId), {
        workflow_config: workflowConfig,
      });
      console.log('Stack saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChatWithStack = () => {
    if (isValid) {
      setIsChatOpen(true);
    }
  };

  React.useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      validateWorkflow();
    }
  }, [nodes, edges]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to Stacks
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              {stackName || 'Workflow Builder'}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
              S
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Component Library */}
        <ComponentLibraryPanel onDragStart={handleDragStart} />

        {/* Workflow Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            onInit={handleInit}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>

          {/* Drop handling */}
          <div
            className="absolute inset-0"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          />
        </div>

        {/* Component Configuration */}
        <ComponentConfigPanel
          selectedNode={selectedNode}
          onUpdateNode={handleUpdateNode}
          onUploadFile={handleUploadFile}
        />
      </div>

      {/* Execution Controls */}
      <ExecutionControls
        onBuildStack={handleBuildStack}
        onChatWithStack={handleChatWithStack}
        onSaveStack={handleSaveStack}
        isValid={isValid}
        validationErrors={validationErrors}
        isBuilding={isBuilding}
        isSaving={isSaving}
      />

      {/* Chat Interface */}
      {isChatOpen && (
        <ChatInterface
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          stackId={parseInt(stackId!)}
          stackName={stackName}
        />
      )}
    </div>
  );
};

export default WorkflowBuilder;
