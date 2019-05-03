import React from 'react';
import SocketIOClient from 'socket.io-client';
import Gauge from 'react-svg-gauge';
import {Grid, Segment, Image} from 'semantic-ui-react';

const valueLabelStyle = {
    textAnchor: "middle",
        fill:"#000000",
        stroke: "none",
        fontStyle: "normal",
        fontVariant: "normal",
        fontWeight: 'bold',
        fontStretch: 'normal',
        lineHeight: 'normal',
        fillOpacity: 1,
        fontSize: 20,
}

const topLabelStyle = {

}

    class Meter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            roomName: '',
            upstream: 0,
            downstream: 0,
            total_up: 0,
            total_down: 0
        }
    }

    componentDidMount() {
        const {roomName, socket} = this.props;

        socket.emit('client', roomName);

        socket.on(roomName, (data) => {
            let up = data.upstream
            let down = data.downstream
            const {total_up, total_down} = this.state
            let total_u = total_up + up
            let total_d = total_down + down
            this.setState({upstream: up, downstream: down, total_up: total_u, total_down: total_d});
        })
    }

    render() {
        const {upstream, downstream, total_up, total_down} = this.state;
        const {roomName} = this.props;
        return (
            <Grid.Column width={3}>
                <Segment>
                    <Image className="widget widget-big-image" src={`./images/logo_${roomName.toLowerCase()}.png`} />
                </Segment>
                <Segment textAlign='center'>
                    <h5>Total Traffic Sent</h5>
                    <p>Upstream: {(total_up / 1000000000).toFixed(2)} Gb</p>
                    <p>Downstream: {(total_down/ 1000000000).toFixed(2)} Gb</p>
                </Segment>
                <Segment textAlign='center'>

                    <Gauge
                        label="downstream | Mbps"
                        value={Number(downstream / 1000000).toFixed(2)}
                        max={5000}
                        width={200}
                        height={250}
                        color={"#00adef"}
                        valueLabelStyle={valueLabelStyle}
                    >
                    </Gauge>

                    <Gauge
                        label="upstream | Mbps"
                        value={Number(upstream / 1000000).toFixed(2)}
                        width={200}
                        max={5000}
                        height={250}
                        color={"#00adef"}
                        valueLabelStyle={valueLabelStyle}
                    >
                    </Gauge>
                </Segment>


            </Grid.Column>



        )

    }
}

export default Meter;
