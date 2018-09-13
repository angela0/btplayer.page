import React, { Component } from 'react';
import { message, Layout, Menu, Dropdown } from 'antd';
import cookie from 'react-cookies';
import {
    BrowserRouter as Router,
    Route, Switch, Redirect, Link
} from 'react-router-dom';

import App from './app/App';
import Info from './info/Info';
import Login from './login/Login';
import Player from './player/Player';
import Search from './search/Search';
import NotFoundPage from './404/404';

import 'antd/dist/antd.css';

const { Header, Content } = Layout;

class Main extends Component {
    constructor (props) {
        super(props);
        this.state = {
            login: false,
            username: "",
        }
    }
    componentWillMount() {
        const {id, name} = cookie.loadAll();
        if (id !== "" && name !== "") {
            this.setState({login: true, username: name});
            fetch(`/btp/login`).then( response => {
                if (response.status === 403) {
                    cookie.remove("id");
                    cookie.remove("name");
                    this.setState({login: false});
                    return
                }
                if (!response.ok) {
                    throw response.headers.get("X-Message");
                }
                this.setState({login: true});
            }).catch( err => {
                message.error(err);
            });
        }
    }

    handleLogout = (e) => {
        fetch(`/btp/logout`).then(response => {
            if (!response.ok) {
                throw response.headers.get('X-Message');
            }
            cookie.remove('id');
            cookie.remove('name');
            this.setState({login: false, tologin: true});
        }).catch( err => {
            message.error(err);
        });
    }
    isLogin = (login, username) => {
        this.setState({login, username});
    }

    render() {
        const {login, username} = this.state;
        const menu = (
            <Menu>
                <Menu.Item key="1" onClick={this.handleLogout}>Logout</Menu.Item>
            </Menu>
        )
        return (
            <Router>
            <Layout className="layout">
                <Header className="header">
                    <Link to="/"><div className="Main-logo"></div></Link>
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        style={{ lineHeight: '64px', float: 'right' }}
                    >
                        <Menu.Item>
                            {login ?
                                <Dropdown overlay={menu} >
                                    <div>{username}</div>
                                </Dropdown>
                                :
                                <Link to="/login">Login</Link>
                            }
                        </Menu.Item>
                    </Menu>
                </Header>
                <Content style={{ padding: '0 50px' }}>
                    <Switch>
                    <Route exact path="/" component={(props) => <App {...props} login={login} />} />
                    <Route path="/login" render={(props) => <Login {...props} login={login} action={this.isLogin} />} />
                    <Route path="/search" component={(props) => <Search {...props} login={login} />} />
                    <Route path="/info" render={(props) => <Info {...props} login={login} />} />
                    <Route path="/player" component={(props) => <Player {...props} login={login} />} />
                    <Route path="/404" component={NotFoundPage} />
                    <Redirect to="/404" />
                    </Switch>
                </Content>
            </Layout>
            </Router>
        );
    }
}

export default Main;
