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
            led = <div className="led-green"/>
        } else {
            led = <div className="led-red"/>
        }

        return (
            <Grid.Column width={2}>
                <Segment>
                    <Image className="widget widget widget-big-image" src={`./images/${remotePhyName.toLowerCase().replace(' ', '_')}.png`} />

                    {led}
                </Segment>
            </Grid.Column>)
    }
}

export default Led;