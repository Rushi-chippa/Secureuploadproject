import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SalesmanRegister from './pages/SalesmanRegister';
import SalesmanDashboard from './pages/SalesmanDashboard';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddProductPage from './pages/AddProductPage';
import Salesmen from './pages/Salesmen';
import Sales from './pages/Sales';
import MySales from './pages/MySales';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Customers from './pages/Customers';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import CompanySettings from './pages/CompanySettings';
import Categories from './pages/Categories';
import Leaderboard from './pages/Leaderboard';
import Performance from './pages/Performance';
import AskAIPage from './pages/AskAIPage';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';

// Components
import Layout from './components/layout/Layout';

// CSS
import './App.css';
import './components/auth/Auth.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CompanyProvider>
          <Router>
            <DataProvider>
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />

              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/register-salesman" element={<SalesmanRegister />} />
                <Route path="/salesman-dashboard" element={<ProtectedRoute><SalesmanDashboard /></ProtectedRoute>} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <ProtectedRoute>
                      <Products />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/salesmen"
                  element={
                    <ProtectedRoute>
                      <Salesmen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-sales"
                  element={
                    <ProtectedRoute>
                      <MySales />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sales"
                  element={
                    <ProtectedRoute>
                      <Sales />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sales/list"
                  element={
                    <ProtectedRoute>
                      <Sales />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sales/add"
                  element={
                    <ProtectedRoute>
                      <Sales />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/company-settings"
                  element={
                    <ProtectedRoute>
                      <CompanySettings />
                    </ProtectedRoute>
                  }
                />

                {/* New/Placeholder Routes for missing features */}
                <Route path="/products/list" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                <Route path="/products/add" element={<ProtectedRoute><AddProductPage /></ProtectedRoute>} />
                <Route path="/products/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />

                <Route path="/sales/report" element={<ProtectedRoute><Reports /></ProtectedRoute>} />

                <Route path="/salesmen/list" element={<ProtectedRoute><Salesmen /></ProtectedRoute>} />
                <Route path="/salesmen/add" element={<ProtectedRoute><Salesmen /></ProtectedRoute>} />

                <Route path="/salesmen/performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />
                <Route path="/salesmen/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

                <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
                <Route path="/customers/list" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
                <Route path="/customers/add" element={<ProtectedRoute><Customers /></ProtectedRoute>} />

                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/ask-ai" element={<ProtectedRoute><AskAIPage /></ProtectedRoute>} />
                <Route path="/help" element={<ProtectedRoute><Contact /></ProtectedRoute>} />

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </DataProvider>
          </Router>
        </CompanyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;