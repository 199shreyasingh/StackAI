// CreateStackModal.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { stackApi } from '../services/api';

interface CreateStackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (name: string, description: string) => void;
}

const CreateStackModal: React.FC<CreateStackModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (name.trim() && !isCreating) {
      setIsCreating(true);
      try {
        const response = await stackApi.createStack({ name, description });
        const newStack = response.data;
        
        if (onCreate) {
          onCreate(name, description);
        }
        
        setName('');
        setDescription('');
        onClose();
        navigate(`/workflow/${newStack.id}`);
      } catch (error) {
        console.error('Failed to create stack:', error);
        // You could add error handling UI here
      } finally {
        setIsCreating(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-lg font-semibold">Create New Stack</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-xl">
            &times;
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Enter stack name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Enter stack description"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t px-4 py-3 space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              name.trim() && !isCreating
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isCreating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStackModal;
