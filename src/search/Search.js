import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Spin, Button, message } from 'antd';
import { List } from 'antd';
import 'antd/lib/spin/style/css';
import 'antd/lib/message/style/css';
import 'antd/lib/list/style/css';
import './Search.css';

class Search extends Component {
    constructor (props) {
        super(props);
        const lct = this.props.location;
        this.url = `${lct.pathname}${lct.search}${lct.hash}`;
        const search = new URLSearchParams(lct.search);
        this.keyword = search.get("keyword");
        this.state = {
            page: 1,
            login: this.props.login,
            dataSource: [],
            loading: true,
            loadingMore: false,
            showLoadingMore: true,
            toinfo: "",
        };
    }

    componentWillMount() {

        this.keyword = this.keyword === null ? "" : this.keyword;
        if (this.props.login) {
            this.getData((data) => {
                for (let item of data) {
                    localStorage.setItem(item.infohash, item);
                }
                const dataSource = this.state.dataSource.concat(data);
                this.setState({dataSource, loading: false});
            });
        }
    }
    componentDidMount() {
        document.title = "Search"
    }

    handleToInfo = (e) => {
        this.setState({toinfo: e.target.name});
    }

    getData = (callback) => {
        let {page} = this.state;
        fetch(`/btp/search?keyword=${this.keyword}&page=${page}`, {
            method: "GET",
        }).then( response => {
            if (!response.ok) {
                throw response.headers.get("X-Message")
            }
            return response.json();
        }).then( data => {
            callback(data.results);
            this.setState({page: page+1});
        }).catch( err => {
            message.error(err);
            callback([]);
        })
    }

    onLoadMore = () => {
        this.setState({loadingMore: true,});
        this.getData((data) => {
            for (let item of data) {
                localStorage.setItem(item.infohash, item);
            }
            const dataSource = this.state.dataSource.concat(data);
            this.setState({dataSource, loadingMore: false,}, () => {
                window.dispatchEvent(new Event('resize'));
            });
        });
    }

    render() {
        const {login, loading, loadingMore, showLoadingMore, dataSource, toinfo} = this.state;
        const loadMore = showLoadingMore ? (
            <div style={{ textAlign: 'center', marginTop: 12, height: 32, lineHeight: '32px' }}>
                {loadingMore && <Spin />}
                {!loadingMore && <Button onClick={this.onLoadMore}>loading more</Button>}
              </div>
        ) : null;
        return (
            <div className="result">
            {!login && <Redirect push to={{
                pathname: "/login",
                from: this.url,
            }} /> }
            {
                toinfo && <Redirect push to={{
                    pathname: "/info",
                    search: `?hash=${toinfo}` }} />
            }
            { 
                loading ? 
                    <div className="spin"><Spin size="large"/></div>
                :
                    <List
                    itemLayout="vertical"
                    size="large"
                    loadMore={loadMore}
                    dataSource={dataSource}
                    renderItem={item => (
                        <List.Item
                        key={item.infohash}
                        extra={item.thumb && <img heigth={100} width={272} alt="logo" src={item.thumb} />}
                        >
                        <List.Item.Meta
                        title={<a name={item.infohash} onClick={this.handleToInfo} >{item.name}</a>}
                        description={item.size}
                        />
                        {item.infohash}
                        </List.Item>
                    )}
                    />
            }

            </div>
        )    
    }
}

export default Search;
