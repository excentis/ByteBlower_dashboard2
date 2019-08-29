import React from 'react';
import HighchartsReact from 'highcharts-react-official'
import {Grid, Segment, Image, Button} from 'semantic-ui-react';
import Highcharts from 'highcharts'

const toAdd = {'downstream':[{'data': [0.0], 'name': 'trunk-1-1'}, {'data': [0.0], 'name': 'trunk-1-2'}, {'data': [0.0], 'name': 'trunk-1-3'}, {'data': [0.0], 'name': 'trunk-1-4'}, {'data': [0.0], 'name': 'trunk-1-5'}, {'data': [0.0], 'name': 'trunk-1-6'}, {'data': [0.0], 'name': 'trunk-1-7'}, {'data': [0.0], 'name': 'trunk-1-8'}]}


class ByteBlowerMeter extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            ds: [],
            us: [],
            downstreamConfig: {
                chart: {
                    type: 'area'
                },
                title: {
                    text: 'Downstream (mbps)'
                },
                
                yAxis: {
                    title: {
                        text: 'Throughput (mbps)'
                    },
                    labels: {
                        formatter: function () {
                            return Number(this.value / 1000000).toFixed(2)
                        }
                    }
                },
                tooltip: {
                    split: true,
                    valueSuffix: ' mbps'
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
            upstreamConfig: {
                chart: {
                    type: 'area'
                },
                title: {
                    text: 'Upstream (mbps)'
                },
                
                yAxis: {
                    title: {
                        text: 'Throughput (mbps)'
                    },
                    labels: {
                        formatter: function () {
                            return Number(this.value / 1000000).toFixed(2)
                        }
                    }
                },
                tooltip: {
                    split: true,
                    valueSuffix: ' mbps'
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
 
        this.updateSeries = this.updateSeries.bind(this)
        this.afterDsChartCreated = this.afterDsChartCreated.bind(this);
        this.afterUsChartCreated = this.afterUsChartCreated.bind(this);
    }
     
    afterDsChartCreated(chart) {
      this.dsChart = chart;
    }
     
 
    afterUsChartCreated(chart) {
        this.usChart = chart;
      }
       
    updateSeries(toAdd, series) {
        const interfaceds = toAdd
        let updatedSeries = []
        interfaceds.forEach(i => {
            let s = series.find((serie => {
                return serie.name == i.name;
            }))
            if(s == undefined) {
                updatedSeries.push(Object.assign({}, i))
            } else {
                updatedSeries.push(Object.assign({}, {...s}, {data: s.data.concat(i.data)}))
            }
        })

        return updatedSeries
    }

    componentDidMount() {
        const {roomName, socket} = this.props;

        socket.emit('client', roomName);

        socket.on(roomName, (data) => {
            let up = data.upstream
            let down = data.downstream
            
            down.forEach(i => {
                let s = this.dsChart.series.find((serie => {
                    return serie.name == i.name;
                }))
                if(!s) {
                    this.dsChart.addSeries(i)
                } else {
                    s.addPoint(i.data[0], true, s.data.length > 40)
                }
            })
            up.forEach(i => {
                let s = this.usChart.series.find((serie => {
                    return serie.name == i.name;
                }))
                if(!s) {
                    this.usChart.addSeries(i)
                } else {
                    s.addPoint(i.data[0], true, s.data.length > 40)
                }
            })
        })
    }

    render() {
        const {roomName} = this.props
        const {downstreamConfig, upstreamConfig} = this.state
        return (
            <Grid.Column>
                <Segment>
                    <Image className="widget widget-big-image" src={`./images/${roomName.toLowerCase().replace(' ', '_')}.png`} />
                </Segment>

                <Segment>
                    <HighchartsReact highcharts={Highcharts} options={downstreamConfig} callback={ this.afterDsChartCreated } ></HighchartsReact>
                
                    <HighchartsReact highcharts={Highcharts} options={upstreamConfig} callback={ this.afterUsChartCreated }></HighchartsReact>
                </Segment>

            </Grid.Column>
        )
    }

}

export default ByteBlowerMeter