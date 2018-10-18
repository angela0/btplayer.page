import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { List, Spin, message } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { canPlay } from '../utils/utils';

import 'antd/lib/message/style/css';
import './Info.css';

class Info extends Component {
    constructor (props) {
        super(props);
        const lct = this.props.location;
        this.url = `${lct.pathname}${lct.search}${lct.hash}`;
        const search = new URLSearchParams(this.props.location.search);
        this.hash = search.get("hash");
        this.state = {
            loading: true,
            login: this.props.login,
            info: {
                name: "",
                size: "",
                infohash: this.hash,
                thumb: "",
                files: [],
            },
        }
    }

    componentWillMount() {
        if (this.props.login) {
            fetch(`/btp/info?hash=${this.hash}`, {
                credentials: 'include',
            }).then( response => {
                if (!response.ok) {
                    throw response.headers.get("X-Message")
                }
                this.makeWs();
            }).catch( err => {
                message.error(err);
                return
            });
        }
    }

    componentDidMount() {
        document.title = "Torrent Info"
    }

    makeWs = () => {
        const schema = window.location.protocol === "https:" ? "wss" : "ws";
        let ws = new WebSocket(`${schema}://${window.location.host}/btp/ws`);
        ws.onmessage = (e) => {
            let info = JSON.parse(e.data);
            localStorage.setItem(info.infohash, e.data);
            info.size = ((bytes) => {
                const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
                let l = 0, n = parseInt(bytes, 10) || 0;
                while(n >= 1024 && ++l)
                    n = n/1024;
                return(n.toFixed(n >= 10 || l < 1 ? 0 : 1) + ' ' + units[l]);
            })(info.size);
            this.setState({info, loading: false});
        }
        ws.onopen = (e) => {
            ws.send(this.hash);
        }
    }

    render() {
        const {login, loading} = this.state;
        return (
            <div className="info">
                {!login && <Redirect push to={{
                    pathname: "/login",
                    from: this.url,
                }} /> }
                {loading && <div className="mask"> <div className="spin"><Spin /></div></div>}
                <List
                    itemLayout="vertical"
                    size="large"
                    dataSource={[this.state.info]}
                    renderItem={item => (
                        <List.Item
                            key={item.infohash}
                            extra={item.thumb && <img width={272} alt="logo" src={item.thumb} />}
                        >
                            <List.Item.Meta
                                title={item.name}
                                description={item.size}
                            />
                        {item.infohash}
                        </List.Item>
                    )}
                />
                <List
                    itemLayout="horizontal"
                    dataSource={this.state.info.files}
                    renderItem={(item, index) => (
                        <List.Item>
                            {canPlay(item) ?
                                <a href={`/player?hash=${this.state.info.infohash}&index=${index}`}>{item}</a> :
                                <CopyToClipboard onCopy={() => message.info("copied")} text={`https://${window.location.host}/btp/file${window.location.search}&index=${index}`}><div className="clickable">{item}</div></CopyToClipboard>
                            }
                        </List.Item>
                    )}
                />
            </div>
        );
    }
}

export default Info;
