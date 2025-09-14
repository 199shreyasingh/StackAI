import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Brain } from 'lucide-react';

interface LLMEngineNodeData {
  label: string;
  config: {
    model: string;
    api_key: string;
    prompt: string;
    temperature: number;
    use_web_search: boolean;
    serpapi_key: string;
  };
}

interface LLMEngineNodeProps {
  data: LLMEngineNodeData;
  selected?: boolean;
}

const LLMEngineNode: React.FC<LLMEngineNodeProps> = ({ data, selected }) => {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 min-w-[200px] ${
      selected ? 'border-purple-500' : 'border-gray-300'
    }`}>
      <div className="flex items-center space-x-2">
        <Brain className="w-4 h-4 text-purple-500" />
        <div className="font-bold text-sm">{data.label}</div>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {data.config?.model || 'OpenAI GPT'}
      </div>
      {data.config?.use_web_search && (
        <div className="text-xs text-blue-600 mt-1">
          Web search enabled
        </div>
      )}
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-purple-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-purple-500"
      />
    </div>
  );
};

export default LLMEngineNode;
