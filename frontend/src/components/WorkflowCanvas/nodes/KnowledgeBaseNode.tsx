import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database } from 'lucide-react';

interface KnowledgeBaseNodeData {
  label: string;
  config: {
    embedding_model: string;
    api_key: string;
    files: string[];
  };
}

interface KnowledgeBaseNodeProps {
  data: KnowledgeBaseNodeData;
  selected?: boolean;
}

const KnowledgeBaseNode: React.FC<KnowledgeBaseNodeProps> = ({ data, selected }) => {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 min-w-[200px] ${
      selected ? 'border-orange-500' : 'border-gray-300'
    }`}>
      <div className="flex items-center space-x-2">
        <Database className="w-4 h-4 text-orange-500" />
        <div className="font-bold text-sm">{data.label}</div>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Document knowledge base
      </div>
      {data.config?.files && data.config.files.length > 0 && (
        <div className="text-xs text-green-600 mt-1">
          {data.config.files.length} file(s) uploaded
        </div>
      )}
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-orange-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-orange-500"
      />
    </div>
  );
};

export default KnowledgeBaseNode;
