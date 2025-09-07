/* eslint-disable no-unused-vars */

import React from 'react'

import "./Navbar.css"
import { BrowserRouter as Router, Routes, Route,Link } from "react-router-dom";

function Navbar() {
  return (
    <div className='navbar'>
        
        
        <div className="content">
            <ul className='list'>
           
                <Link style={{textDecoration:"none"}} to="/admin/signup"><li className='list-content'>Admin</li></Link>
                <Link style={{textDecoration:"none"}} to="/createuser"><li className='list-content' id='signup'>Sign up</li></Link>
                <Link style={{textDecoration:"none"}} to="/login"><li className='list-content' id='login'>Log in</li></Link>
            </ul>
        </div>
      
    </div>
  )
}

export default Navbar
