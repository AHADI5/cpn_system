
import './App.css'
import { AuthProvider } from './context/AuthContext'
import LoginPage from './pages/loginPage'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <AuthProvider>
      <Router>
          <div>
            <main>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}
              </Routes>
            </main>
          </div>
      </Router>
    </AuthProvider>
 
  )
}

export default App
