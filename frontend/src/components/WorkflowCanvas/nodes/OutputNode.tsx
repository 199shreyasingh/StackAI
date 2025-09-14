import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileText } from 'lucide-react';

interface OutputNodeData {
  label: string;
  output: string;
}

interface OutputNodeProps {
  data: OutputNodeData;
  selected?: boolean;
}

const OutputNode: React.FC<OutputNodeProps> = ({ data, selected }) => {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 min-w-[200px] ${
      selected ? 'border-green-500' : 'border-gray-300'
    }`}>
      <div className="flex items-center space-x-2">
        <FileText className="w-4 h-4 text-green-500" />
        <div className="font-bold text-sm">{data.label}</div>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Final response output
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-green-500"
      />
    </div>
  );
};

export default OutputNode;
