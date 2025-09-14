import React from 'react';
import { Play, MessageSquare, Save, AlertCircle } from 'lucide-react';

interface ExecutionControlsProps {
  onBuildStack: () => void;
  onChatWithStack: () => void;
  onSaveStack: () => void;
  isValid: boolean;
  validationErrors: string[];
  isBuilding: boolean;
  isSaving: boolean;
}

const ExecutionControls: React.FC<ExecutionControlsProps> = ({
  onBuildStack,
  onChatWithStack,
  onSaveStack,
  isValid,
  validationErrors,
  isBuilding,
  isSaving,
}) => {
  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBuildStack}
            disabled={!isValid || isBuilding}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              isValid && !isBuilding
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>{isBuilding ? 'Building...' : 'Build Stack'}</span>
          </button>

          <button
            onClick={onChatWithStack}
            disabled={!isValid}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              isValid
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat with Stack</span>
          </button>

          <button
            onClick={onSaveStack}
            disabled={isSaving}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              !isSaving
                ? 'bg-gray-500 text-white hover:bg-gray-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {!isValid && validationErrors.length > 0 && (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">
                {validationErrors.length} error{validationErrors.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {!isValid && validationErrors.length > 0 && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm text-red-800">
            <strong>Validation Errors:</strong>
            <ul className="mt-1 list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionControls;
