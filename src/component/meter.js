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
            // const {total_up, total_down} = this.state
            // let total_u = total_up + up
            // let total_d = total_down + down
            this.setState({upstream: up, downstream: down});
            // , total_up: total_u, total_down: total_d
        })
    }
    componentWillUnmount() {
        window.removeEventListener(
          "beforeunload",
          this.saveStateToLocalStorage.bind(this)
        );
    
        // saves if component has a chance to unmount
        this.saveStateToLocalStorage();
    }
    
    saveStateToLocalStorage() {
        // for every item in React state
        for (let key in this.state) {
          // save to localStorage
          localStorage.setItem(key, this.state[key]);
        }
      }

    hydrateStateWithLocalStorage() {
        console.log('retrieving localstate')
        // for all items in state
        for (let key in this.state) {
        // if the key exists in localStorage
            if (localStorage.hasOwnProperty(key)) {
                // get the key's value from localStorage
                let value = localStorage.getItem(key);
        
                // parse the localStorage string and setState
                try {
                    this.setState({ [key]: value });
                } catch (e) {
                // handle empty string
                    this.setState({ [key]: value });
                }
            }
        }
    }

    /** "prestart": "npm install && npm run build", */
    render() {
        const {upstream, downstream, total_up, total_down} = this.state;
        const {roomName} = this.props;
        return (
            <Grid.Column>
                <Segment>
                    <Image className="widget widget-big-image" src={`./images/${roomName.toLowerCase().replace(' ', '_')}.png`} />
                </Segment>
                {/* <Segment textAlign='center'>
                    <h5>Total Sent</h5>
                    <p>Upstream: {(total_up / 1000000000 / 8).toFixed(2)} GB</p>
                    <p>Downstream: {(total_down/ 1000000000 / 8).toFixed(2)} GB</p>
                </Segment> */}
                <Segment textAlign='center'>

                    <Gauge
                        label="downstream | Mbps"
                        value={Number(downstream / 1000000 / 8).toFixed(2)}
                        max={5000}
                        
                        color={"#00adef"}
                        valueLabelStyle={valueLabelStyle}
                    >
                    </Gauge>

                    <Gauge
                        label="upstream | Mbps"
                        value={Number(upstream / 1000000).toFixed(2)}

                        max={12000}
 
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
