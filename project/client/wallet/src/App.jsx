import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Login/Login";
import UserDashboard from "./Components/Dashboard/UserDashboard.jsx";
import AddMoney from "./Components/AddMoney";
import Balance from "./Components/Balance.jsx";
import SendMoney from "./Components/SendMoney.jsx";
import History from "./Components/History.jsx";
import AdminDashboard from "./Components/Admin/AdminDashboard";
import AdminSignup from "./Components/Admin/AdminSignup";
import AdminLogin from "./Components/Admin/AdminLogin";
import Signup from "./Components/Signup/Signup.jsx"
import Home from "./screens/Home"

export default function App() {
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("adminName"); // check if admin is logged in

  return (
    <Router>
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<Home/>} />
         <Route path="/createuser" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        
         
           <Route path="/admin/signup" element={<AdminSignup/>} />
            <Route path="/admin/login" element={<AdminLogin/>} />

        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/add" element={<AddMoney />} />
        <Route path="/balance" element={<Balance />} />
        <Route path="/send" element={ <SendMoney />} />
        <Route path="/history" element={ <History />} />
        

        {/* Admin Routes */}
         <Route path="/admin" element={<AdminDashboard />} />

        
        
      </Routes>
    </Router>
  );
}

