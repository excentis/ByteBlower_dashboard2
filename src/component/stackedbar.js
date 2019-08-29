import React from 'react';
import SocketIOClient from 'socket.io-client';
import Gauge from 'react-svg-gauge';
import {Grid, Segment, Image} from 'semantic-ui-react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';

class StackedBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            configModems: {
                chart: {
                    type: 'area'
                },
                title: {
                    text: 'Throughput per modem: All Profiles'
                },
                xAxis: {
                    categories: [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7],
                    title: {
                        text: 'Time (seconds)'
                    }
                },
                yAxis: {
                    title: {
                        text: 'Throughput (bitrate/0.1s)'
                    },
                    labels: {
                        formatter: function () {
                            return this.value / 10000000
                        }
                    }
                },
                tooltip: {
                    split: true,
                    valueSuffix: ' bit'
                },
                plotOptions: {
                    area: {
                        stacking: 'normal',
                        lineColor: '#666666',
                        lineWidth: 1,
                        marker: {
                            enabled: false,
                        }
                    }
                },
                series: []
              },
            configProfiles : {
            chart: {
                type: 'area'
            },
            title: {
                text: 'Throughput per profile: all modems'
            },
            xAxis: {
                categories: [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7],
                title: {
                    text: 'Time (seconds)'
                }
            },
            yAxis: {
                title: {
                    text: 'Throughput (bitrate/0.1s) '
                },
                labels: {
                    formatter: function () {
                        return this.value / 10000000;
                    }
                }
            },
            tooltip: {
                split: true,
                valueSuffix: ' bit'
            },
            plotOptions: {
                area: {
                    stacking: 'normal',
                    lineColor: '#666666',
                    lineWidth: 1,
                    marker: {
                        enabled: false,
                    }
                }
            },
            series: []
            }
        }
       
    }

    componentDidMount() {
        const {roomName, socket} = this.props;
        socket.emit('xra', roomName);
        
        socket.on(roomName, (data) => {
            const modems = data.modems
            const profiles = data.profiles
            this.setState({
                configModems: {
                    series: modems
                },
                configProfiles: {
                    series: profiles
                },
            })
        })
    }

    render() {
        const {roomName} = this.props;
        const {configModems, configProfiles} = this.state;
        return (
            <Grid.Column>
                <Segment>
                    <Image className="widget widget-big-image" src={`./images/xra.png`} />
                </Segment>
                
                 <Segment>
                    <HighchartsReact highcharts={Highcharts} options={configModems} ref="chartModems"></HighchartsReact>
                
                    <HighchartsReact highcharts={Highcharts} options={configProfiles} ref="chartProfiles"></HighchartsReact>
                </Segment>
            </Grid.Column>
        );
        ;
    }
}

export default StackedBar;