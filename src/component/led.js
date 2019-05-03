import React from 'react';
import {Grid, Segment, Image} from 'semantic-ui-react';

class Led extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: 'down'
        }
    }

    componentDidMount() {
        const {remotePhyName, remotePhyIp, socket} = this.props;
        socket.emit('remotePhy', [remotePhyName, remotePhyIp]);

        socket.on(remotePhyName, (data) => {
            console.log(data.pingResponse);
            this.setState({status: data.pingResponse})
        })
    }

    render() {
        const {status} = this.state;
        const {remotePhyName, remotePhyIp} = this.props;

        let led;

        if (status == 0){
            led = <div class="led-green"/>
        } else {
            led = <div class="led-red"/>
        }

        return (
            <div class='led-container'>
                <Segment textAlign='center' style={{height: '100%'}}>
                    <p>{remotePhyName} - {remotePhyIp}</p>
                    <div class="led-box">
                        {led}
                    </div>
                </Segment>
            </div>)
    }
}

export default Led;