import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { message } from 'antd';
import './App.css';
import 'antd/dist/antd.css';


class App extends Component {
    constructor (props, context) {
        super(props);
        const lct = this.props.location;
        this.url = `${lct.pathname}${lct.search}${lct.hash}`;
        this.state = {
            keyword: "",
            hash: "",
            doSearch: false,
            doInfo: false,
            login: this.props.login,
        }
    }

    componentDidMount() {
        document.title = "BTPlayer"
    }

    handleSearch = (e) => {
        if (e.keyCode !== 13) {
            return
        }
        const keyword = e.target.value;
        if (keyword === "") {
            message.warning("search can't be empty")
            return
        }
        this.setState({keyword, doSearch: true});
    }

    handleFocus = (e) => {
        const {keyword} = this.state;
        e.target.value = keyword;
    }
    handleBlur = (e) => {
        const {keyword} = this.state;
        if(keyword === ""){
            e.target.value = "Input Search"
        }
    }
    handleChange = (e) => {
        this.setState({"keyword": e.target.value})
    }

    handleInfoFocus = (e) => {
        e.target.value = "";
    }
    handleInfoBlur = (e) => {
        e.target.value = "Paste Search"
    }
    handleInfoChange = (e) => {
        const hash = e.target.value;
        if (hash.length !== 32 && hash.length !== 40) {
            message.error("wrong infohash");
        }
        this.setState({hash});
    }
    handleInfo = (e) => {
        if (e.keyCode !== 13) {
            return
        }
        this.setState({doInfo: true});
    }

    render() {
        const {login, keyword, doSearch, doInfo} = this.state;
        return (
            <div className="App">
            {!login && <Redirect push to={{
                pathname: "/login",
                    from: this.url,
            }} /> }
            {doSearch && <Redirect push to={{
                pathname: "/search",
                    search: `?keyword=${keyword}`
            }} /> }
            {doInfo && <Redirect push to={{
                push: true,
                    pathname: "/info",
                    search: `?hash=${this.state.hash}`
            }} /> }
            <div className="container">
            <section className="app__body">
            <input
            className="App-input"
            defaultValue="Input Search"
            onKeyDown={this.handleSearch}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            onChange={this.handleChange}
            />
            <input
            className="App-input App-input-last"
            defaultValue="Paste InfoHash"
            onKeyDown={this.handleInfo}
            onFocus={this.handleInfoFocus}
            onBlur={this.handleInfoBlur}
            onChange={this.handleInfoChange}
            />
            </section>
            </div>
            </div>
        );
    }
}

export default App;
