import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { stackApi } from '../services/api';

const useMediaQuery = (query: any) => {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

interface Stack {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const MyStacks = () => {
  const isMd = useMediaQuery('(min-width: 768px)');
  const navigate = useNavigate();
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStacks();
  }, []);

  const loadStacks = async () => {
    try {
      const response = await stackApi.getStacks();
      setStacks(response.data);
    } catch (error) {
      console.error('Failed to load stacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStack = async (name: string, description: string) => {
    try {
      const response = await stackApi.createStack({ name, description });
      const newStack = response.data;
      setStacks(prev => [...prev, newStack]);
      navigate(`/workflow/${newStack.id}`);
    } catch (error) {
      console.error('Failed to create stack:', error);
    }
  };

  const navPadding = isMd ? '15px 30px' : '10px 20px';
  const iconSize = isMd ? '32px' : '24px';
  const iconFontSize = isMd ? '16px' : '14px';
  const logoFontSize = isMd ? '18px' : '16px';
  const containerPadding = isMd ? '30px' : '20px';
  const headerFontSize = isMd ? '28px' : '24px';
  const buttonPadding = isMd ? '10px 20px' : '8px 16px';
  const cardPadding = isMd ? '30px' : '20px';
  const cardHeaderFontSize = isMd ? '24px' : '20px';
  const cardTextFontSize = isMd ? '16px' : '14px';

  return (
    <div
      style={{
        backgroundColor: '#f8f9fa',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          backgroundColor: 'white',
          padding: navPadding,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              borderRadius: '50%',
              width: iconSize,
              height: iconSize,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: iconFontSize,
              marginRight: isMd ? '10px' : '8px',
            }}
          >
            ai
          </div>
          <span
            style={{
              fontWeight: 'bold',
              color: '#343a40',
              fontSize: logoFontSize,
            }}
          >
            GenAI Stack
          </span>
        </div>
        <div
          style={{
            backgroundColor: '#6f42c1',
            color: 'white',
            borderRadius: '50%',
            width: iconSize,
            height: iconSize,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: iconFontSize,
          }}
        >
          S
        </div>
      </nav>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          padding: containerPadding,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: isMd ? '30px' : '20px',
            flexWrap: 'wrap',
          }}
        >
          <h1 style={{ fontSize: headerFontSize, color: '#343a40', margin: 0 }}>
            My Stacks
          </h1>
          <button
            onClick={() => navigate('/create-stack')}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: buttonPadding,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: isMd ? '16px' : '14px',
              marginTop: isMd ? 0 : '10px',
            }}
          >
            + New Stack
          </button>
        </div>

        {/* Stacks or Empty State */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading stacks...</p>
            </div>
          ) : stacks.length > 0 ? (
            <div className="w-full max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {stacks.map((stack) => (
                  <div
                    key={stack.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/workflow/${stack.id}`)}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {stack.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {stack.description || 'No description'}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(stack.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/workflow/${stack.id}`);
                        }}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Edit Stack →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: 'white',
                padding: cardPadding,
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                textAlign: 'center',
                width: '100%',
                maxWidth: isMd ? '500px' : '100%',
              }}
            >
              <h2
                style={{
                  fontSize: cardHeaderFontSize,
                  color: '#343a40',
                  marginBottom: '8px',
                }}
              >
                Create New Stack
              </h2>
              <p
                style={{
                  fontSize: cardTextFontSize,
                  color: '#6c757d',
                  marginBottom: '16px',
                }}
              >
                Start building your generative AI apps with our essential tools
                and frameworks
              </p>
              <button
                onClick={() => navigate('/create-stack')}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: buttonPadding,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: isMd ? '16px' : '14px',
                }}
              >
                + New Stack
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Render modal overlay when route matches */}
      <Outlet />
    </div>
  );
};

export default MyStacks;
