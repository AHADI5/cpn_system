import LoginPage from './pages/loginPage';
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex">
          <main className="p-4 w-full">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              {/* <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><UserList /></ProtectedRoute>} /> */}
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;