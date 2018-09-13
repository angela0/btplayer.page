import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { message, Button, Input } from 'antd';
import cookie from "react-cookies";
import "./Login.css";

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
            login: this.props.login,
            username: "",
            password: "",
        }
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
                throw response.headers.get('X-Message');
            }
            const username = cookie.load("name");
            if (this.props.action !== null) {
                this.props.action(true, username);
            }
            this.setState({login: true});
        }).catch( err => {
            message.error(err);
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
                login && <Redirect to={this.from} />
            }
            <div className="login">
                <header>
                    <h1>Log In To Your Account</h1>
                </header>
                <fieldset>
                    <div className="group username">
                        <label>Username</label>
                        <Input id="username" type="text" placeholder="Username" onChange={this.handleInputChange} />
                    </div>
                    <div className="group">
                        <label>Password</label>
                        <Input id="password" type="password" placeholder="Password" onChange={this.handleInputChange} />
                    </div>
                    <div className="group last">
                        <Button type="primary" onClick={this.handleLogin}>Login</Button>
                    </div>
                </fieldset>
            </div>
            </div>
        )
    }
}

export default Login;
