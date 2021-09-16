import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { List, Spin, message } from 'antd';
import Lightbox from "react-awesome-lightbox";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { canPlay, isPic } from '../utils/utils';


// You need to import the CSS only once
import "react-awesome-lightbox/build/style.css";
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
            imageSrc: "",
        }
    }

    componentWillMount() {
        let v = localStorage.getItem(this.hash);
        while (v) {
            try {
                let info = JSON.parse(v);
                this.setState({info, loading: false});
            } catch(e) {
                localStorage.removeItem(this.hash);
                break;
            }
            return;
        }
        if (this.props.login) {
            fetch(`/btp/info?hash=${this.hash}`, {
                method: "PUT",
                credentials: 'include',
            }).then( response => {
                if (!response.ok) {
                    throw response.headers.get("X-Message")
                }
                this.props.wsSend({"type": "info", "data": this.hash});
            }).catch( err => {
                message.error(err);
            });
            return
        }
    }

    componentDidMount() {
        document.title = "Torrent Info"
    }
    componentWillReceiveProps(newProps) {
        if (newProps.wsData !== null) {
            this.processWsData(newProps.wsData);
        }
    }

    processWsData = (info) => {
        info.size = ((bytes) => {
            const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            let l = 0, n = parseInt(bytes, 10) || 0;
            while(n >= 1024 && ++l)
                n = n/1024;
            return(n.toFixed(n >= 10 || l < 1 ? 0 : 1) + ' ' + units[l]);
        })(info.size);
        localStorage.setItem(info.infohash, JSON.stringify(info));
        this.setState({info, loading: false});
    }
    
    clickImage = (index) => {
        this.setState({imageSrc: `/btp/file${window.location.search}&index=${index}`});
    }

    closeImage = () => {
        this.setState({imageSrc: ""});
    }

    render() {
        const {login, loading, imageSrc} = this.state;
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
                            extra={item.thumb && <img alt="logo" src={item.thumb} />}
                        >
                            <List.Item.Meta
                                title={item.name}
                                description={item.size}
                                className="word-break"
                            />
                            <div className="word-break">{item.infohash}</div>
                        </List.Item>
                    )}
                />
                <List
                    itemLayout="horizontal"
                    dataSource={this.state.info.files}
                    renderItem={(item, index) => (
                        <List.Item>
                            {canPlay(item) ?
                                <Link to={`/player?hash=${this.state.info.infohash}&index=${index}`}>{item}</Link>
                                :
                                isPic(item) ?
                                    <div style={{cursor: "zoom-in"}} onClick={()=>this.clickImage(index)}>{item}</div>
                                    :
                                    <CopyToClipboard 
                                        onCopy={() => message.info("copied")}
                                        text={`https://${window.location.host}/btp/file${window.location.search}&index=${index}`}>
                                        <div className="clickable">{item}</div>
                                    </CopyToClipboard>
                            }
                        </List.Item>
                    )}
                />
                <Lightbox image={imageSrc} onClose={this.closeImage} />
            </div>
        );
    }
}

export default Info;
