import React, { Component } from 'react'
var shallowCompare = require('react-addons-shallow-compare');
import Paper from 'material-ui/Paper';
const ReactHighcharts = require('react-highcharts');

var HighchartsMore = require('highcharts-more');
HighchartsMore(ReactHighcharts.Highcharts);

const base_config = {
  chart: {
      zoomType: 'xy',
      height: 250,
      animation: false,
  },
  credits: { enabled: false },
  title: { text: null },
  xAxis: {
    visible: false
  },
  yAxis: {
    title: {
        text: 'tSNE embedding'
    },
    minorGridLineWidth: 0,
    gridLineWidth: 0,
    minorTickInterval: null,
    tickAmount: 0,
    labels: {enabled: false}
  },
  tooltip: {
    enabled: false
  },
  plotOptions: {
      series: {
          point: {
              events: {}
          },
          animation: false,
          type: 'scatter',
          // enableMouseTracking: false, // faster but prevents any mouse/tooltip
      },
      scatter: {
          animation: false,
          marker: {
              radius: 3,
          },
          // tooltip: {
          //     followPointer: false,
          //     headerFormat: '<b>{series.name}</b><br>',
          //     pointFormat: '{point.addDate}<br>{point.severity}<br>{point.oid}'
          // }
      }
  },
  series: [{
              type: 'scatter',
              name:'all samples',
              color: 'rgba(178, 235, 242, .8)',
              zIndex:0,
              turboThreshold: 0,
            }]
}

export default class Projection2D extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }
  xyLimits(samples){
    const chart = this.refs.projectionChart.getChart();
    const xabs = samples.map( s => Math.abs(s.x) )
    const yabs = samples.map( s => Math.abs(s.y) )
    const max = Math.max(...xabs, ...yabs)
    const lim = max * 1.2;
    chart.xAxis[0].setExtremes(-lim, lim,false,false) // redraw and animation
    chart.yAxis[0].setExtremes(-lim, lim,false,false)
  }
  componentDidMount(){
    const { samples } = this.props
    const samples_ = samples.toJS()
    const chart = this.refs.projectionChart.getChart();
    this.xyLimits(samples_)
    chart.series[0].update({data:samples_}, true, false)
  }
  componentWillReceiveProps(nextProps){
    if (nextProps.samples !== this.props.samples) {
      const { samples } = nextProps
      const samples_ = samples.toJS()
      const chart = this.refs.projectionChart.getChart();
      this.xyLimits(samples_)
      chart.series[0].update({data:samples_}, true, false)
    }
  }
  shouldComponentUpdate(nextProps) {
    return false
  }
  render(){
    const config = base_config
    const { style } = this.props
    return <Paper style={style}><ReactHighcharts ref="projectionChart" isPureConfig config={config} ></ReactHighcharts></Paper>
  }
}
