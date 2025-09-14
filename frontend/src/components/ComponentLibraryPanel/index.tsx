import React from 'react';
import { MessageSquare, Database, Brain, FileText } from 'lucide-react';

interface ComponentItem {
  id: string;
  type: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const components: ComponentItem[] = [
  {
    id: 'user-query',
    type: 'userQuery',
    label: 'User Query',
    icon: <MessageSquare className="w-4 h-4" />,
    description: 'Entry point for user queries'
  },
  {
    id: 'knowledge-base',
    type: 'knowledgeBase',
    label: 'Knowledge Base',
    icon: <Database className="w-4 h-4" />,
    description: 'Document knowledge base'
  },
  {
    id: 'llm-engine',
    type: 'llmEngine',
    label: 'LLM Engine',
    icon: <Brain className="w-4 h-4" />,
    description: 'AI language model'
  },
  {
    id: 'output',
    type: 'output',
    label: 'Output',
    icon: <FileText className="w-4 h-4" />,
    description: 'Final response output'
  }
];

interface ComponentLibraryPanelProps {
  onDragStart: (event: React.DragEvent, component: ComponentItem) => void;
}

const ComponentLibraryPanel: React.FC<ComponentLibraryPanelProps> = ({ onDragStart }) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Components</h3>
      <div className="space-y-2">
        {components.map((component) => (
          <div
            key={component.id}
            draggable
            onDragStart={(e) => onDragStart(e, component)}
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
          >
            <div className="text-gray-600">{component.icon}</div>
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-800">
                {component.label}
              </div>
              <div className="text-xs text-gray-500">
                {component.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentLibraryPanel;
