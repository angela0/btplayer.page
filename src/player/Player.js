import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Player } from 'video-react';
import { Drawer, Button, List, message } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { canPlay } from '../utils/utils';

import "video-react/dist/video-react.css";
import 'antd/lib/drawer/style/css';
import './Player.css';


class VPlayer extends Component {
    constructor (props) {
        super(props);
        const lct = this.props.location;
        this.url = `${lct.pathname}${lct.search}${lct.hash}`;
        const search = new URLSearchParams(this.props.location.search);
        this.hash = search.get("hash");
        const index = search.get("index");
        this.info = JSON.parse(localStorage.getItem(this.hash));
        this.state = {
            login: this.props.login,
            index: index ? index : 0,
            drawVisible: false,
            noinfo: this.info ? false : true,
        };
    }

    componentDidMount() {
        document.title = "Player"

        this.refs.player.subscribeToStateChange(this.handleStateChange);
    }

    showDrawer = () => {
        this.setState({
            drawVisible: true,
        });
    };

    onClose = () => {
        this.setState({
            drawVisible: false,
        });
    };

    handleOnclick = (e) => {
        const index = e.target.getAttribute("index");
        if (index === this.state.index) {
            return
        }
        this.setState({index, drawVisible: false});
    }

    handleStateChange = (state, prevState) => {
        if (prevState === null && state.error !== null) {
            message.error(state.error);
        }
    }

    render() {
        const {login, index, drawVisible, noinfo} = this.state;
        return (
            <div className="App">
                {!login && <Redirect push to={{
                    pathname: "/login",
                    from: this.url,
                }} /> }
                {noinfo && <Redirect push to={{
                    pathname: "/info",
                    search: `hash=${this.hash}`,
                    from: this.url,
                }} /> }

                <div className="container">
                    <section>
                        <div className="Player-video">
                            <Player
                                fluid={false}
                                width={791}
                                height={444}
                                ref="player"
                                playsInline
                                src={`/btp/file?hash=${this.hash}&index=${index}`}
                            />
                            <Button type="primary" onClick={this.showDrawer}>Open</Button>
                        </div>
                        <Drawer
                            title="Play List"
                            placement="right"
                            closable={false}
                            onClose={this.onClose}
                            visible={drawVisible}
                        >
                            <List
                                dataSource={this.info ? this.info.files : []}
                                renderItem={(item, index) => {
                                    let displayItem = canPlay(item) ? <div index={index} className="clickable" onClick={this.handleOnclick}>{item}</div> : <CopyToClipboard onCopy={() => message.info("copied")} text={`https://${window.location.host}/btp/file${window.location.search}`}><div className="clickable">{item}</div></CopyToClipboard>
                                    return <List.Item>
                                    {
                                        index.toString() === this.state.index ?
                                        <div style={{background: "#f1e9e9"}}>{displayItem}</div> :
                                        displayItem
                                    }
                                    </List.Item>
                                }}
                            />
                        </Drawer>
                    </section>
                </div>
            </div>
        )
    }
}

export default VPlayer;
