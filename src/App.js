import React, { Component } from 'react';
import './App.css';
import Meter from "./component/meter";
import Led from "./component/led";
import {Grid, Header, Segment} from 'semantic-ui-react';
import SocketIOClient from "socket.io-client";

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
                            <img src="./images/ByteBlower-by-Excentis-small-transparent.png" alt=""/>
                        </Grid.Column>
                        <Grid.Column width={10} className="widget-title" textAlign="center">
                            <Header as="h1" className="title">Excentis DOCSIS 3.1 Interop 2019</Header>
                            <Header as="h3" className="text">Cable Modem Traffic Overview</Header>
                        </Grid.Column>
                    </Grid>
                </Segment>
                <Grid columns='equal' centered>
                    <Grid.Row>
                        {/* Change IP addresses to correct ones */}
                        <Led remotePhyName="BKtel" remotePhyIp="10.3.3.243"  socket={socket}></Led>
                        <Led remotePhyName="Casa" remotePhyIp="10.3.3.243"  socket={socket}></Led>
                        <Led remotePhyName="Cisco" remotePhyIp="10.3.3.243"  socket={socket}></Led>
                        <Led remotePhyName="Commscope" remotePhyIp="10.3.3.243"  socket={socket}></Led>
                        <Led remotePhyName="DCT DELTA" remotePhyIp="10.3.3.243"  socket={socket}></Led>
                        <Led remotePhyName="DEV Systemtechnik" remotePhyIp="10.3.3.243"  socket={socket}></Led>
                        <Led remotePhyName="Huawei" remotePhyIp="10.3.3.243"  socket={socket}></Led>
                        <Led remotePhyName="Nokia" remotePhyIp="10.3.3.243"  socket={socket}></Led>
                        <Led remotePhyName="Teleste" remotePhyIp="10.3.3.243"  socket={socket}></Led>
                        <Led remotePhyName="Vecima Networks" remotePhyIp="10.3.3.243"  socket={socket}></Led>
                        <Led remotePhyName="Vector Technologies" remotePhyIp="10.3.3.243"  socket={socket}></Led>
                    </Grid.Row>

                    <Grid.Row>
                        <Meter roomName="AVM" socket={socket}/>
                        <Meter roomName="Broadcom" socket={socket}/>
                        <Meter roomName="Hitron" socket={socket}/>
                        <Meter roomName="Ubee Interactive" socket={socket}/>
                        <Meter roomName="Sagemcom" socket={socket}/>
                        <Meter roomName="Technicolor" socket={socket}/>
                    </Grid.Row>
                       
                </Grid>

            </div>


        );
    }
}

export default App;
