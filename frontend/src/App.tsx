
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MyStacks from './pages/MyStacks';
import CreateStackModal from './pages/CreateStackModal';
import WorkflowBuilder from './pages/WorkflowBuilder';

function App() {
  return (
    <Router>
      <Routes>
        {/* Parent route for MyStacks */}
        <Route path="/" element={<MyStacks />}>
          {/* Nested modal route */}
          <Route
            path="create-stack"
            element={
              <CreateStackModal
                isOpen={true}
                onClose={() => window.history.back()} // closes modal
                onCreate={(name, description) => {
                  console.log('New stack created:', { name, description });
                }}
              />
            }
          />
        </Route>
        {/* Workflow Builder route */}
        <Route path="/workflow/:stackId" element={<WorkflowBuilder />} />
      </Routes>
    </Router>
  );
}

export default App;
