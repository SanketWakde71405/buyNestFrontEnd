import { Routes, Route } from "react-router-dom";

// Layouts
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

//Pages
import Home from "./pages/Home";
import Auth from "./pages/Auth";


function App() {
   
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/auth/signin" element={<Auth />} />
        <Route path="/auth/register" element={<Auth />} />
      </Route>
    </Routes>
  );
}

export default App
