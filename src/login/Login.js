import React, { Component } from 'react';
import "./Login.css";
import { Redirect } from 'react-router-dom';
import LoginIcon from '../img/icon.png';
import { message } from 'antd';
import cookie from "react-cookies";

class Login extends Component {
    constructor (props) {
        super(props);
        const lct = this.props.location;
        this.from = lct.from;
        this.url = `${lct.pathname}${lct.search}${lct.hash}`;
        if (!this.from) {
            this.from = "/";
        }
        this.state = {
            "username": "",
            "password": "",
        }
    }

    componentWillMount() {
        const id = cookie.load('id');
        let login = id ? true : false;
        this.setState({login});
    }
    componentDidMount() {
        document.title = "Login"
    }

    handleLogin = () => {
        fetch(`/btp/login`, {
            method: "POST",
            body: `username=${encodeURIComponent(this.state.username)}&password=${encodeURIComponent(this.state.password)}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            }
        }).then( response => {
            if (!response.ok) {
                throw response.status;
            }
            this.setState({login: true});
        }).catch( err => {
            message.error(err.message);
        });
    }

    handleInputChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value,
        })
    }

    render () {
        const {login} = this.state;
        return (
            <div className="container">
            {
                login ? <Redirect to={this.from} /> : null
            }
            <div className="login">
            <div className="login-screen">
            <div className="login-icon">
            <img src={LoginIcon} alt="Welcome to Mail App" />
            <h4>Welcome to <small>Big App</small></h4>
            </div>

            <div className="login-form">
            <div className="form-group">
            <input type="text" className="form-control login-field" value={this.state.username} placeholder="Enter your name" id="username" onChange={this.handleInputChange}/>
            </div>

            <div className="form-group">
            <input type="password" className="form-control login-field" value={this.state.passsword} placeholder="Password" id="password" onChange={this.handleInputChange}/>
            </div>

            <a className="btn btn-primary btn-lg btn-block" onClick={this.handleLogin}>Log in</a>
            </div>
            </div>
            </div>
            </div>
        )
    }
}

export default Login;
