import React, { Component } from 'react';
import './App.css';
import Meter from "./component/meter";
import StackedBar from "./component/stackedbar";
import Led from "./component/led";
import {Grid, Divider, Header, Segment} from 'semantic-ui-react';
import SocketIOClient from "socket.io-client";
import ByteBlowerMeter from './component/byteblower';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            endpoint: '/',
            socket: null
        }
    }
    componentWillMount() {
        const {endpoint} = this.state;
        this.setState({socket: SocketIOClient.connect(endpoint)});
    }

    render() {
        /*
         * ADD VENDORS BELOW
         */
        const {socket} = this.state;
        return (
            <div>
                <Segment>
                    <Grid>
                        <Grid.Column width={6} textAlign="center">
                            {/* <img src="./images/ByteBlower-by-Excentis-small-transparent.png" alt=""/> */}
                            <h1>Logo Placeholder</h1>
                        </Grid.Column>
                        <Grid.Column width={10} className="widget-title" textAlign="center">
                            <Header as="h1" className="title">Placeholder</Header>
                            <Header as="h3" className="text">Cable Modem Traffic Overview</Header>
                        </Grid.Column>
                    </Grid>
                </Segment>
                <Grid centered>
                    {/* <Grid.Row columns={6}> */}
                        {/* Change IP addresses to correct ones */}
                         {/* <Led remotePhyName="phy1"  socket={socket}></Led>
                        <Led remotePhyName="phy2"  socket={socket}></Led>
                        <Led remotePhyName="phy3"  socket={socket}></Led>
                        <Led remotePhyName="phy4"  socket={socket}></Led>
                        <Led remotePhyName="phy5"  socket={socket}></Led>
                        <Led remotePhyName="phy6"  socket={socket}></Led> */}
                    {/* </Grid.Row>
                    <Grid.Row columns={6}>
                        <Led remotePhyName="phy7"  socket={socket}></Led>
                        <Led remotePhyName="phy8"  socket={socket}></Led>
                        <Led remotePhyName="phy9"  socket={socket}></Led>
                        <Led remotePhyName="phy10" socket={socket}></Led>
                        <Led remotePhyName="phy11" socket={socket}></Led>
                        <Led remotePhyName="phy12" socket={socket}></Led>
                    </Grid.Row>
                        */}
                    
                    <Grid.Row columns={2}>
                        {/* <Meter roomName="byteblower" socket={socket}/> */}
                        <ByteBlowerMeter roomName="byteblower" socket={socket}></ByteBlowerMeter>
                        <StackedBar roomName="xradata" socket = {socket}/>
                        {/* <Meter roomName="vendor3" socket={socket}/>
                        <Meter roomName="vendor4" socket={socket}/>
                        <Meter roomName="vendor5" socket={socket}/>
                        <Meter roomName="vendor6" socket={socket}/> */}
                    </Grid.Row>
                       
                </Grid>

            </div>


        );
    }
}

export default App;
