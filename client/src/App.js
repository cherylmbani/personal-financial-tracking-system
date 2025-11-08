import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './Components/NavBar.jsx'; 
import Login from './Pages/Login.jsx';          
import Signup from './Pages/Signup.jsx';          
import Dashboard from './Pages/Dashboard.jsx';  
import Transactions from './Pages/Transactions.jsx'; 
import Analytics from './Pages/Analytics.jsx';  
import Home from './Pages/Home.jsx'

function App(){
  const [isLoggedIn, setIsLoggedIn]=React.useState(false);

  return(
    <Router>
      <div className="App">
        <NavBar isLoggedIn={isLoggedIn} onLogout={()=>setIsLoggedIn(false)} />
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path='/transactions' element={<Transactions />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="home" element={<Home />} />
          {/* Other routes */}
        </Routes>
      </div>
    </Router>
  )
}
export default App;