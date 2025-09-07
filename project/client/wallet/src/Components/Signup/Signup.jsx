
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import {Link} from "react-router-dom"
import "bootstrap/dist/css/bootstrap.min.css";
import "./Signup.css"
const BASE_URL = import.meta.env.VITE_API_URL;
console.log(BASE_URL);

function Signup() {
  
  const navigate=useNavigate(); 
  const handlesubmit = async (e) => {
    e.preventDefault(); 
    const response = await fetch(`${BASE_URL}/createuser`, { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: credentials.name,
         number: credentials.number,   // add this line
        email: credentials.email, 
        password: credentials.password,
      }) 
    });
    console.log(response);
    const json = await response.json(); 
    console.log(json);
    if (!json.success) {
      alert("Enter valid credentials");
    }
    if(json.success){
      localStorage.setItem("useremail",credentials.email)
      
      navigate("/login"); 
    }
  }
  const [credentials, setCredentials] = useState({
    name: "",
    number:"",
    email: "",
    password: "",
  }); 
  const onchange = (event) => {
    setCredentials({
      ...credentials,
      [event.target.name]: event.target.value //creates a new objects with same properties as credentials
    })
  }
    return (
      
      <div className="main-div">
        <div className="first-div"></div>
      
        <div className="signup">

      <form onSubmit={handlesubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter name"
            name="name"
            value={credentials.name}
            onChange={onchange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="number">Contact number</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter contact number"
            name="number"
            value={credentials.number}
            onChange={onchange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="exampleInputEmail1">Email address</label>
          <input
            type="email"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            placeholder="Enter email"
            name="email"
            value={credentials.email}
            onChange={onchange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="exampleInputPassword1">Password</label>
          <input
            type="password"
            className="form-control"
            id="exampleInputPassword1"
            placeholder="Password (minimum 5 characters)"
            name="password"
            value={credentials.password}
            onChange={onchange}
          />
        </div>
        <div className="button">
        <button type="submit"className="btn btn-primary" >
          Submit
        </button>
        <Link to="/login"><button type="button" className="btn custom-btn">Already a user</button></Link>
        </div>
          
        
      </form>
    </div>
    <div className="third-div"></div>
    </div>
        
      
    )
  }
  
  export default Signup