import { Outlet, replace, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import type { User } from "./types";

interface AuthFormData {
  email: string
  name?: string
}

const App = () => {

  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    currentUser ? localStorage.setItem("currentUser", JSON.stringify(currentUser)) 
                : localStorage.removeItem("currentUser");
  }, [currentUser]);

  const handleAuthSubmit = (data:AuthFormData) => {
    const user:User = {
      email: data.email,
      name: data.name || 'User',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=random`,
    };
    setCurrentUser(user);
    navigate('/', {replace: true});
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    navigate('/login', {replace: true});
  };

  const ProtectedLayout = () => {
    <Layout user={currentUser} onlogout={handleLogout} >
      <Outlet />
    </Layout>
  };

  return(
    <Routes>
      <Route path="/login" element={<div className=" fixed inset-0 bg-black bg-opacity-50 flex 
        items-center justify-center"  >
        <Login onSubmit={handleAuthSubmit} onSwitchMode={() => navigate('/signup')} />
      </div>} />

      <Route path="/signup" element={<div className=" fixed inset-0 bg-black bg-opacity-50 flex 
        items-center justify-center"  >
        <SignUp user={currentUser} onLogout={handleLogout} onSwitchMode={() => navigate('/login')} />
      </div>} />

      <Route path="/" element={<Layout user={null} onlogout={handleLogout} />} />
    </Routes>
  )
} 

export default App;