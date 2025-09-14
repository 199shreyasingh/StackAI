import React, { useState } from 'react';
import { Eye, EyeOff, Upload, X } from 'lucide-react';

interface ComponentConfigPanelProps {
  selectedNode: any | null;
  onUpdateNode: (nodeId: string, data: any) => void;
  onUploadFile: (file: File) => void;
}

const ComponentConfigPanel: React.FC<ComponentConfigPanelProps> = ({
  selectedNode,
  onUpdateNode,
  onUploadFile,
}) => {
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuration</h3>
        <p className="text-gray-500 text-sm">Select a component to configure</p>
      </div>
    );
  }

  const toggleApiKeyVisibility = (field: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const updateConfig = (field: string, value: any) => {
    onUpdateNode(selectedNode.id, {
      ...selectedNode.data,
      config: {
        ...selectedNode.data.config,
        [field]: value
      }
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadFile(file);
    }
  };

  const renderConfig = () => {
    switch (selectedNode.type) {
      case 'userQuery':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Query Placeholder
              </label>
              <input
                type="text"
                value={selectedNode.data.config?.placeholder || ''}
                onChange={(e) => updateConfig('placeholder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your query here..."
              />
            </div>
          </div>
        );

      case 'knowledgeBase':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Embedding Model
              </label>
              <select
                value={selectedNode.data.config?.embedding_model || 'openai'}
                onChange={(e) => updateConfig('embedding_model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="openai">OpenAI (text-embedding-3-large)</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey.embedding ? 'text' : 'password'}
                  value={selectedNode.data.config?.api_key || ''}
                  onChange={(e) => updateConfig('api_key', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter API key"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility('embedding')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showApiKey.embedding ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Documents
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">Click to upload PDF</span>
                </label>
              </div>
              {selectedNode.data.config?.files && selectedNode.data.config.files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {selectedNode.data.config.files.map((file: string, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-gray-100 px-2 py-1 rounded">
                      <span className="text-sm text-gray-700">{file}</span>
                      <button
                        onClick={() => {
                          const newFiles = selectedNode.data.config.files.filter((_: any, i: number) => i !== index);
                          updateConfig('files', newFiles);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'llmEngine':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <select
                value={selectedNode.data.config?.model || 'openai'}
                onChange={(e) => updateConfig('model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="openai">OpenAI GPT-4o-mini</option>
                <option value="gemini">Google Gemini Pro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey.llm ? 'text' : 'password'}
                  value={selectedNode.data.config?.api_key || ''}
                  onChange={(e) => updateConfig('api_key', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter API key"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility('llm')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showApiKey.llm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prompt
              </label>
              <textarea
                value={selectedNode.data.config?.prompt || ''}
                onChange={(e) => updateConfig('prompt', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="You are a helpful AI assistant..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedNode.data.config?.temperature || 0.7}
                onChange={(e) => updateConfig('temperature', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                {selectedNode.data.config?.temperature || 0.7}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="web-search"
                checked={selectedNode.data.config?.use_web_search || false}
                onChange={(e) => updateConfig('use_web_search', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="web-search" className="text-sm font-medium text-gray-700">
                Enable Web Search
              </label>
            </div>

            {selectedNode.data.config?.use_web_search && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SerpAPI Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey.serpapi ? 'text' : 'password'}
                    value={selectedNode.data.config?.serpapi_key || ''}
                    onChange={(e) => updateConfig('serpapi_key', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter SerpAPI key"
                  />
                  <button
                    type="button"
                    onClick={() => toggleApiKeyVisibility('serpapi')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showApiKey.serpapi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'output':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Output Format
              </label>
              <select
                value={selectedNode.data.config?.format || 'text'}
                onChange={(e) => updateConfig('format', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="text">Plain Text</option>
                <option value="markdown">Markdown</option>
                <option value="html">HTML</option>
              </select>
            </div>
          </div>
        );

      default:
        return <div>Unknown component type</div>;
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuration</h3>
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700">
          {selectedNode.data.label}
        </div>
        <div className="text-xs text-gray-500">
          {selectedNode.type}
        </div>
      </div>
      {renderConfig()}
    </div>
  );
};

export default ComponentConfigPanel;
