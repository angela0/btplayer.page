import React, { Component } from 'react';
import { message, Layout, Menu, List, Spin } from 'antd';
import cookie from 'react-cookies';
import {
    BrowserRouter as Router,
    Route, Switch, Redirect, Link
} from 'react-router-dom';

import { getHashMeta } from '../utils/utils';

import 'antd/dist/antd.css';

class Infos extends Component {
    constructor (props) {
        super(props);
        const lct = this.props.location;
        this.url = `${lct.pathname}${lct.search}${lct.hash}`;
        const search = new URLSearchParams(this.props.location.search);
        this.page = search.get("page") === null ? 1 : search.get;
        this.state = {
            loading: true,
            login: this.props.login,
            dataTotal: 0,
            dataSource: [],
            page: this.page,
        }
    }

    componentWillMount() {
        if (this.props.login) {
            // const allhashes = localStorage.getItem("allhashes")
            // if (allhashes !== "") {
            //     let hashes = allhashes.split(",");
            //     this.setState({dataSource: hashes, dataTotal: hashes, loading: false});
            //     return
            // }
                
            this.pullData((data) => {
                this.setState({dataSource: data.hashes, dataTotal: data.hashes.length, loading: false});
                localStorage.setItem("allhashes", JSON.stringify(data.hashes));
            })
        }
    }

    componentDidMount() {
        document.title = "Torrent Infos"
    }

    pullData = (callback) => {
        this.setState({loading: true});
        fetch(`/btp/infos?page=${this.state.page}`, {
            credentials: 'include',
        }).then( response => {
            if (!response.ok) {
                throw response.headers.get("X-Message")
            }
            return response.json();
        }).then( data => {
            callback(data);
        }).catch( err => {
            message.error(err);
            callback({"results": [], "pageTotal": 0});
        });
    }

    // delete a hashinfo
    handleDelete = (e, hash) => {
        this.setState({loading: true});
        fetch(`/btp/info?hash=${hash}`, {
            credentials: 'include',
            method: "DELETE",
        }).then( response => {
            if (!response.ok) {
                throw response.headers.get('X-Message');
            }
            let {dataSource} = this.state;
            dataSource = dataSource.filter(v => v.hash !== hash);
            this.setState({dataSource, dataTotal: dataSource.length, loading: false});
            localStorage.setItem("allhashes", JSON.stringify(dataSource));
            localStorage.removeItem(hash);
        }).catch( err => {
            message.error(err);
            this.setState({loading: false});
        })
    }
    
    render() {
        const {login, page, pageTotal, loading} = this.state;
        let {dataSource} = this.state;
        dataSource = dataSource.map(v => ({hash: v.hash, name: v.name === "" ? getHashMeta(v.hash, "name") : v.name }))
        return (
            <div className="infos">
            {!login && <Redirect push to={{
                pathname: "/login",
                    from: this.url,
            }} /> }

            {loading && <div className="mask"> <div className="spin"><Spin /></div></div>}
            <div className="container">
            <List
            itemLayout="vertical"
            size="default"
            pagination={{
                onChange: (page) => {
                    this.setState({page});
                },
                pageSize: 10,
                total: pageTotal,
            }}
            dataSource={dataSource}
            renderItem={item => (
                <List.Item key={item.hash} actions={[<a onClick={(e) => {this.handleDelete(e, item.hash)}}>delete</a>]}>
                {<Link to={`/info?hash=${item.hash}`}><div className="word-break">{item.hash}</div></Link>}
                <List.Item.Meta
                    className="word-break"
                    description={item.name}
                />
                </List.Item>
            )}
            />
            </div>
            </div>
        );
    }
}

export default Infos;
