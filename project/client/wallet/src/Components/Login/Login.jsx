import  { useState } from "react";
import {useNavigate} from "react-router-dom"
import {Link} from "react-router-dom"
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css"

const BASE_URL = import.meta.env.VITE_API_URL;


function Login() {
  const navigate=useNavigate();
   const handlesubmit=async(e)=>{
    e.preventDefault();
    const response=await fetch(`${BASE_URL}/loginuser`,{
      method: "POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify(
        {
          email: credentials.email,
          password: credentials.password,
        }
      )

    })
    const json = await response.json();
    if (!json.success) {
      alert("Enter valid credentials");
    }
    if(json.success){
      navigate("/dashboard");
      
      localStorage.setItem("authToken",json.authToken) 
      localStorage.setItem("name",json.name)
      localStorage.setItem("useremail", credentials.email); // ✅ Store email in localStorage

      


    }
  }
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const onchange = (event) => {
    setCredentials({
      ...credentials,
      [event.target.name]: event.target.value
    })
  }
  return (
    <div className="main-div">
        <div className="first-div"></div>
        <div>
          <div>
            <h4 className="message">Log in with your signup credentials</h4>
          </div>
          <div className="login">
      <form onSubmit={handlesubmit}>
        
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
          <small id="emailHelp" className="form-text text-muted">
            We will never share your email with anyone else.
          </small>
        </div>
        <div className="form-group">
          <label htmlFor="exampleInputPassword1">Password</label>
          <input
            type="password"
            className="form-control"
            id="exampleInputPassword1"
            placeholder="Password"
            name="password"
            value={credentials.password}
            onChange={onchange}
          />
        </div>
        <div className="button">
        <button type="submit" className="btn custom-btn">
          Submit
        </button>
        <Link to="/createuser"><button type="button" className="btn btn-primary m-4">I am a new user</button></Link>
        </div>
        </form>
        </div>
        </div>
        <div className="third-div"></div>
    </div>
  );
}
   
  
  export default Login