import React, { Component } from 'react';
import './App.css';
import Meter from "./component/meter";
import {Grid, Header, Segment} from 'semantic-ui-react';
import SocketIOClient from "socket.io-client";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            endpoint: 'http://localhost:8080/',
            socket: null
        }
    }
    componentWillMount() {
        const {endpoint} = this.state;
        this.setState({socket: SocketIOClient.connect(endpoint)});
    }

    render() {
        const {socket} = this.state;
        return (
            <div>
                <Segment>
                    <Grid>
                        <Grid.Column width={6}>
                            <img src="./images/ByteBlower-by-Excentis-small-transparent.png" alt=""/>
                        </Grid.Column>
                        <Grid.Column width={10} className="widget-title">
                            <Header as="h1" className="title">Excentis DOCSIS 3.1 Interop 2017</Header>
                            <Header as="h3" className="text">Cable Modem Traffic Overview</Header>
                        </Grid.Column>
                    </Grid>
                </Segment>
                <Grid columns='equal' centered>

                        <Meter roomName="Huawei" socket={socket}/>
                        <Meter roomName="Askey" socket={socket}/>
                        <Meter roomName="bcm" socket={socket}/>
                        <Meter roomName="humax" socket={socket}/>
                        <Meter roomName="intel" socket={socket}/>
                        <Meter roomName="sagemcom" socket={socket}/>

                        <Meter roomName="technicolor" socket={socket}/>
                        <Meter roomName="ubee" socket={socket}/>
                        <Meter roomName="cbn" socket={socket}/>


                </Grid>

            </div>


        );
    }
}

export default App;