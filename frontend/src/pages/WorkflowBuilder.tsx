import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorkflowCanvas from '../components/WorkflowCanvas';
import ComponentLibraryPanel from '../components/ComponentLibraryPanel';
import ComponentConfigPanel from '../components/ComponentConfigPanel';
import ExecutionControls from '../components/ExecutionControls';
import ChatInterface from '../components/ChatInterface';
import { stackApi, workflowApi, documentApi } from '../services/api';

interface WorkflowBuilderProps {}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = () => {
  const { stackId } = useParams<{ stackId: string }>();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);

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
  useEffect(() => {
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

  // Drag & Drop
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

      if (reactFlowWrapper.current) {
        const bounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = {
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        };

        const newNode = {
          id: `${component.type}-${Date.now()}`,
          type: component.type,
          position,
          data: {
            label: component.label,
            config: getDefaultConfig(component.type),
          },
        };

        setNodes((nds) => [...nds, newNode]);
      }
    },
    []
  );

  const getDefaultConfig = (type: string) => {
    switch (type) {
      case 'userQuery':
        return { placeholder: 'Write your query here.' };
      case 'knowledgeBase':
        return { embedding_model: 'openai', api_key: '', files: [] };
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

  // Node/Edge handlers
  const handleNodesChange = useCallback((newNodes: any[]) => {
    setNodes(newNodes);
  }, []);

  const handleEdgesChange = useCallback((newEdges: any[]) => {
    setEdges(newEdges);
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
          config: { ...kbNode.data.config, files: updatedFiles },
        });
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  // Workflow validation
  const validateWorkflow = useCallback(async () => {
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
  }, [nodes, edges]);

  // Validate whenever nodes or edges change
  useEffect(() => {
    const validate = async () => {
      if (nodes.length > 0 || edges.length > 0) {
        await validateWorkflow();
      }
    };
    validate();
  }, [nodes, edges, validateWorkflow]);

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
      await stackApi.updateStack(parseInt(stackId), { workflow_config: workflowConfig });
      console.log('Stack saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChatWithStack = () => {
    if (isValid) setIsChatOpen(true);
  };

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
          <WorkflowCanvas
            initialNodes={nodes}
            initialEdges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
          />

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
