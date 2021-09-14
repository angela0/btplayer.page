import React, { Component } from 'react';
import { message, Layout, Menu, Dropdown, Spin } from 'antd';
import { Row, Col } from 'antd';
import cookie from 'react-cookies';
import {
    BrowserRouter as Router,
    Route, Switch, Redirect, Link
} from 'react-router-dom';

import App from './app/App';
import Info from './info/Info';
import Infos from './infos/Infos';
import Login from './login/Login';
import Player from './player/Player';
import Search from './search/Search';
import NotFoundPage from './404/404';

import 'antd/dist/antd.css';
import './Main.css';

const { Header, Content } = Layout;
const { SubMenu } = Menu;

class Main extends Component {
    constructor (props) {
        super(props);
        this.state = {
            login: false,
            loading: true,
            username: "",
            infoData: null,
            playerData: null,
        }
        this.ws = null;
    }
    componentWillMount() {
        const {id, name} = cookie.loadAll();
        if (id && name) {
            fetch(`/btp/login`, {
                credentials: 'include',
            }).then( response => {
                if (response.status === 403) {
                    cookie.remove("id");
                    cookie.remove("name");
                    this.setState({login: false, loading: false});
                    return
                }
                if (!response.ok) {
                    throw response.headers.get("X-Message");
                }
                this.buildWebsocket();
                this.setState({login: true, username: name});
            }).catch( err => {
                message.error(err);
            });

            return
        }
        this.setState({login: false, loading: false});
    }

    buildWebsocket = () => {
        clearTimeout(this.reconnectTimer);
        const scheme = window.location.protocol === "https:" ? "wss" : "ws";
        this.ws = new WebSocket(`${scheme}://${window.location.host}/btp/ws`);
        this.ws.onerror = (e) => {
            message.error(e);
            this.ws.close();
        }
        this.ws.onmessage = (e) => {
            let data = JSON.parse(e.data);
            if (data.type === "info") {
                this.setState({infoData: data.data});
            } else if (data.type === "player") {
                this.setState({playerData: data.data});
            } else if (data.type === "error") {
                message.error(data.data);
            } else if (data.type === "ping") {
                this.ws.send(`{"type": "pong"}`)
            } else {
                message.error("something goes wrong!")
            }
        }
        this.ws.onopen = (e) => {
            this.setState({loading: false});
        }
        this.ws.onclose = (e) => {
            message.info("websocket has been closed, reconnct after 5 seconds");
            this.reconnectTimer = setTimeout(_ => this.buildWebsocket(), 5000);
        }
    }

    childrenSendMsg = (msg) => {
        this.ws.send(JSON.stringify(msg));
    }
    loginCallback = (login, username) => {
        this.setState({login, username});
        this.buildWebsocket();
    }
    handleLogout = (e) => {
        fetch(`/btp/logout`, {
            credentials: 'include',
        }).then(response => {
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

    render() {
        const {login, username, loading} = this.state;
        // const login = true;
        // const username = "angela";
        // const loading = false;
        const menu = (
            <SubMenu title={<span>{username}</span>}>
            <Menu.Item key="1"><Link to="/infos">infos</Link></Menu.Item>
            <Menu.Item key="2" onClick={this.handleLogout}>Logout</Menu.Item>
            </SubMenu>
        )
        return (
            <Router>
                <Layout className="layout">
                <Header className="header clearfix">
                <Row>
                    <Col xs={2} sm={4} md={6} lg={8} xl={10}>
                        <Link to="/"><div className="Main-logo"></div></Link>
                    </Col>
                    <Col style={{ lineHeight: '64px' }} >
                        <Menu
                            theme="dark"
                            mode="horizontal"
                            style={{ lineHeight: '64px', float: 'right' }}
                        >
                            
                            {login ?
                                // <Dropdown overlay={menu}> <div>{username}</div> </Dropdown>
                                <SubMenu title={<span>{username}</span>}>
                                    <Menu.Item key="1"><Link to="/infos">infos</Link></Menu.Item>
                                    <Menu.Item key="2" onClick={this.handleLogout}>Logout</Menu.Item>
                                </SubMenu>
                                :
                                <Menu.Item><Link to="/login">Login</Link></Menu.Item>
                            }
                            
                        </Menu>
                    </Col>
                </Row>
                </Header>
            { loading ?
                <div className="mask"> <div className="spin"><Spin /></div></div> :
                <Content>
                <Switch>
                <Route exact path="/" render={(props) => <App {...props} login={login} />} />
                <Route path="/login" render={(props) => <Login {...props} login={login} action={this.loginCallback} />} />
                <Route path="/search" render={(props) => <Search {...props} login={login} />} />
                <Route path="/info" render={(props) => <Info {...props} login={login} wsData={this.state.infoData} wsSend={this.childrenSendMsg} />} />
                <Route path="/infos" render={(props) => <Infos {...props} login={login} />} />
                <Route path="/player" render={(props) => <Player {...props} login={login} wsData={this.state.playerData} wsSend={this.childrenSendMsg} />} />
                <Route path="/404" component={NotFoundPage} />
                <Redirect to="/404" />
                </Switch>
                </Content>
            }
            </Layout>
            </Router>
        );
    }
}

export default Main;
