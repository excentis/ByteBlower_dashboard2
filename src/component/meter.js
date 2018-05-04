import React from 'react';
import SocketIOClient from 'socket.io-client';
import Gauge from 'react-svg-gauge';
import {Grid, Segment, Image} from 'semantic-ui-react';

const topLabelStyle = {

}

class Meter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            roomName: '',
            upstream: 0,
            downstream: 0,
        }
    }

    componentDidMount() {
        const {roomName, socket} = this.props;

        socket.emit('client', roomName);

        socket.on(roomName, (data) => {
            console.log(data);
            this.setState({upstream: data.upstream, downstream: data.downstream});
        })
    }

    render() {
        const {upstream, downstream} = this.state;
        const {roomName} = this.props;
        return (
            <Grid.Column width={3}>
                <Segment>
                    <Image className="widget widget-big-image" src={`./images/logo.${roomName.toLowerCase()}.png`}/>
                </Segment>
                <Segment textAlign='center'>

                    <Gauge
                        label="downstream"
                        value={downstream}
                        width={150}
                        height={200}
                        color={"#00adef"}
                    >
                    </Gauge>

                    <Gauge
                        label="upstream"
                        value={upstream}
                        width={160}
                        height={200}
                        color={"#00adef"}
                    >
                    </Gauge>
                </Segment>


            </Grid.Column>



        )

    }
}

export default Meter;