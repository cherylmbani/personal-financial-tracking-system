import React, {useState} from 'react';
import {NavLink} from 'react-router-dom';
import '../Styles/NavBar.css';

const NavBar=({isLoggedIn, onLogout})=>{
    return(
        <nav className="navbar">
            <div className="navbar-brand">
                <NavLink
                to="/" className="navbar-logo">
                    💰 M-Pesa Tracker
                </NavLink>
            </div>
            {/*navbar links*/}
            <div className="navbar-links">
                {isLoggedIn ? (
                    <>
                    <NavLink to="/dashboard"
                    className={({isActive})=>
                    isActive? "nav-link-active":"nav-link"
                    }
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                    to='/transactions'
                    className={({isActive})=>
                    isActive? "nav-link-active":"nav-link"}
                    >
                        Transactions
                    </NavLink>
                    <NavLink
                    to="/analytics"
                    className={({isActive})=>
                    isActive ?"nav-link-active":"nav-link"}
                    >
                        Analytics
                    </NavLink>
                    <button onClick={onLogout} className="nav-link logout-btn">
                        Logout
                    </button>
                    </>
                ):(
                    <>
                    <NavLink 
                    to="/login"
                    className={({ isActive }) => 
                    isActive ? 'nav-link-active' : 'nav-link'}
                    >
                        Login
                    </NavLink>
            
                    <NavLink 
                    to="/signup"
                    className={({ isActive }) => 
                    isActive ? 'nav-link-active' : 'nav-link'}
                    >
                        Sign Up
                    </NavLink>

                    </>
                )
                    
                }
            </div>

        </nav>
    );

};
export default NavBar;
