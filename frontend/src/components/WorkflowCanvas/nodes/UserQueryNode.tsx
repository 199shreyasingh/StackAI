import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';

interface UserQueryNodeProps {
  data: {
    label: string;
    query?: string;
    onChange?: (value: string) => void;
  };
  selected?: boolean;
}

const UserQueryNode: React.FC<UserQueryNodeProps> = ({ data, selected }) => {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 min-w-[220px] ${selected ? 'border-blue-500' : 'border-gray-300'}`}>
      <div className="flex items-center space-x-2">
        <MessageSquare className="w-4 h-4 text-blue-500" />
        <div className="font-bold text-sm">{data.label}</div>
      </div>
      <div className="text-xs text-gray-500 mt-1">Enter point for queries</div>

      <input
        type="text"
        placeholder="Write your query here..."
        value={data.query || ''}
        onChange={(e) => data.onChange?.(e.target.value)}
        className="mt-2 w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  );
};

export default UserQueryNode;
