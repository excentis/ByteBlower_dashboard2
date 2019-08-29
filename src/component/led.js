import React from 'react';
import {Grid, Segment, Image} from 'semantic-ui-react';

class Led extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: 'down',
            ip: '',
        }
       
    }

    componentDidMount() {
        const {remotePhyName, socket} = this.props;
        socket.emit('remotePhy', remotePhyName);

        socket.on(remotePhyName, (data) => {
            this.setState({status: data.pingResponse, ip: data.phyIp})
        })
    }

    render() {
        const {status, ip} = this.state;
        const {remotePhyName} = this.props;

        let led;

        if (status == 0){
            led = <div className="led-green"/>
        } else {
            led = <div className="led-red"/>
        }

        return (
            <Grid.Column width={2}>
                <Segment>
                    <p>{ip}</p>
                </Segment>
                <Segment>
                    <Image className="widget widget widget-big-image" src={`./images/${remotePhyName.toLowerCase().replace(' ', '_')}.png`} />

                    {led}
                </Segment>
            </Grid.Column>)
    }
}

export default Led;