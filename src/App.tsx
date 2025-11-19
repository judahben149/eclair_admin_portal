import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ConceptsPage } from './pages/ConceptsPage';
import { ConceptEditPage } from './pages/ConceptEditPage';
import { ConceptViewPage } from './pages/ConceptViewPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/concepts"
          element={
            <ProtectedRoute>
              <ConceptsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/concepts/new"
          element={
            <ProtectedRoute>
              <ConceptEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/concepts/:id/edit"
          element={
            <ProtectedRoute>
              <ConceptEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/concepts/:id"
          element={
            <ProtectedRoute>
              <ConceptViewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
