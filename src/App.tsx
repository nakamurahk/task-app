import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import FocusTime from './components/FocusTime';
import HomeTaskList from './components/HomeTaskList';
import QuickAddTaskModal from './components/QuickAddTaskModal';
import Footer from './components/Footer';
import Tasks from './screens/Tasks/Tasks';
import Settings from './screens/Settings/Settings';
import Analyze from './screens/Analyze/Analyze';
import Login from './screens/Auth/Login';
import Signup from './screens/Auth/Signup';
import EmailVerification from './screens/Auth/EmailVerification';
import { TaskProvider } from './contexts/TaskContext';
import { FocusProvider, useFocus } from './contexts/FocusContext';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './tailwind.css';
import './style.css';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>読み込み中...</div>; // ローディング状態で無理にNavigateしない
  }

  // ログインしていない場合のみ遷移
  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <TaskProvider>
      <FocusProvider>
        {children}
        <Footer activeTab="home" />
      </FocusProvider>
    </TaskProvider>
  );
};

const Home: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isEffectModeOn } = useFocus();

  return (
    <>
      {isEffectModeOn && <FocusTime />}
      <HomeTaskList onAddTaskClick={() => setIsModalOpen(true)} />
      <QuickAddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <ThemeProvider>
          <Router>
            <div className="phone-frame">
              <div className="app-container">
                <Header />
                <main className="main-content">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/verify-email" element={<EmailVerification />} />
                    <Route path="/" element={
                      <PrivateRoute>
                        <Home />
                      </PrivateRoute>
                    } />
                    <Route path="/tasks" element={
                      <PrivateRoute>
                        <Tasks />
                      </PrivateRoute>
                    } />
                    <Route path="/analyze" element={
                      <PrivateRoute>
                        <Analyze />
                      </PrivateRoute>
                    } />
                    <Route path="/settings" element={
                      <PrivateRoute>
                        <Settings />
                      </PrivateRoute>
                    } />
                  </Routes>
                </main>
              </div>
            </div>
          </Router>
        </ThemeProvider>
      </AppProvider>
    </AuthProvider>
  );
};

export default App; 