import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Tasks from './pages/Tasks';
import { useAuthStore } from './store/useAuthStore';
import Annotation from "./pages/Annotation";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <Tasks /> 
            </ProtectedRoute>
          } 
        />

        <Route
          path="/annotation"
          element={
              <ProtectedRoute>
                  <Annotation />
              </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;