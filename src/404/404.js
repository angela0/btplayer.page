import React, { Component } from 'react';
import Bird from '../img/404.png';
import './404.css';

class NotFoundPage extends Component {
    constructor (props) {
        super(props);
        const lct = this.props.location;
        this.url = `${lct.pathname}${lct.search}${lct.hash}`;
        this.state = {
        }
    }
    render() {
        return (
            <div className="errorpage">
            <div>
                <img src={Bird} alt="404 Page Not Found" />
                <h1>This bird has flown.</h1>
                <h2>404 Page Not Found</h2>
                <p>what do you find fucking what?</p>
            </div> 
            </div>
        )
    }
}

export default NotFoundPage;
