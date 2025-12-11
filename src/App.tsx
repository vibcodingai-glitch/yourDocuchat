import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { UsageProvider } from './contexts/UsageContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Protected pages
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Chat from './pages/Chat';
import YouTube from './pages/YouTube';
import History from './pages/History';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <UsageProvider>
          <BrowserRouter>
            <Routes>
              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <Upload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/youtube"
                element={
                  <ProtectedRoute>
                    <YouTube />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route path="/payment-success" element={<PaymentSuccess />} />
            </Routes>
          </BrowserRouter>
        </UsageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
