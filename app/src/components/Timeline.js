import React, { Component } from 'react'
const ReactHighcharts = require('react-highcharts');
import { hsl } from 'd3-color'

export default class Timeline extends Component {

  componentDidMount(){
    const chart = this.refs.timelineChart.getChart();
    if (this.props.volume) {
      chart.series[0].setData(this.props.volume)
    }
    if (this.props.selected) {
      const { selected } = this.props
      const new_date = new Date(selected.get('lastTimestamp')).getTime()
      chart.xAxis[0].addPlotLine({
                value: new_date,
                color: e.get('fillColor') || 'rgba(0, 188, 212, .8)',
                width: 3,
                id: 'plot-line-'+new_date,
                zIndex: 1,
      })
    }
    if (this.props.highlightedEvents) {
      const { highlightedEvents } = this.props
      highlightedEvents.shift().forEach( (e, i) => {
        const date = new Date(e.get('lastTimestamp')).getTime()
        chart.xAxis[0].addPlotLine({
                  value: date,
                  color: e.get('fillColor') || 'rgba(0, 188, 212, .8)',
                  width: 2,
                  id: 'plot-line-'+date,
                  zIndex: 0,
        })
      })
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.fillColor !== this.props.fillColor) {
      const chart = this.refs.timelineChart.getChart();
      const { fillColor } = nextProps
      const colorHigh = hsl(fillColor)
      const colorLow = hsl(fillColor)
      colorHigh.opacity = 0.4
      colorLow.opacity = 0
      chart.options.plotOptions.area.fillColor.stops = [
        [0, colorHigh.toString()],
        [1, colorLow.toString()]
      ]
      chart.series[0].update({color: fillColor, data: nextProps.volume })
    }
    if (nextProps.volume !== this.props.volume) {
      const chart = this.refs.timelineChart.getChart();
      chart.series[0].setData(nextProps.volume)
    }
    if (nextProps.selected !== this.props.selected) { // and not undefined....
      const { selected } = nextProps
      const chart = this.refs.timelineChart.getChart();
      if (this.props.selected){
        const old_date = new Date(this.props.selected.get('lastTimestamp')).getTime()
        chart.xAxis[0].removePlotLine('plot-line-'+old_date)
      }
      const new_date = new Date(selected.get('lastTimestamp')).getTime()
      chart.xAxis[0].addPlotLine({
                value: new_date,
                color: selected.get('fillColor') || 'rgba(0, 96, 100, 1)',
                width: 3,
                id: 'plot-line-'+new_date,
                zIndex: 1
      })
    }
    if (nextProps.highlightedEvents !== this.props.highlightedEvents) {
      const chart = this.refs.timelineChart.getChart();
      // remove old vertical lines
      this.props.highlightedEvents.shift().forEach(
        e => {
          const d = new Date(e.get('lastTimestamp')).getTime()
          chart.xAxis[0].removePlotLine('plot-line-'+d)
      })
      // add new vertical lines
      const { highlightedEvents } = nextProps
      highlightedEvents.shift().forEach( (e, i) => {
        const date = new Date(e.get('lastTimestamp')).getTime()
        chart.xAxis[0].addPlotLine({
                  value: date,
                  color: e.get('fillColor') || 'rgba(0, 188, 212, .8)',
                  width: 2,
                  id: 'plot-line-'+date,
                  zIndex: 0,
        })
      })
    }
  }
  shouldComponentUpdate(nextProps) {
    return false;
  }
  render(){
    let config = {
      chart: {
          zoomType: 'x',
          height: 150,
      },
      credits: { enabled: false },
      title: { text: null },
      legend: { enabled: false},
      xAxis: {
        type: 'datetime'
      },
      yAxis: {
        title: {
            text: 'Volume of events'
        },
        min: 0
      },
      plotOptions: {
        area: {
            fillColor: {
                linearGradient: {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1
                },
                stops: [
                    [0, 'rgba(178, 235, 242, .4)'],
                    [1, 'rgba(0, 188, 212, 0)']
                ]
            },
            marker: {
                radius: 2
            },
            lineWidth: 1,
            states: {
                hover: {
                    lineWidth: 1
                }
            },
            threshold: null,
            step: "left"
        }
      },
      series: [{
                  name:'all events',
                  type: 'area'
               }]
    }
    const { fillColor } = this.props
    if (fillColor) {
      const colorHigh = hsl(fillColor)
      const colorLow = hsl(fillColor)
      colorHigh.opacity = 0.4
      colorLow.opacity = 0
      config.plotOptions.area.fillColor.stops = [
        [0, colorHigh.toString()],
        [1, colorLow.toString()]
      ]
      config.series[0] = {...config.series[0], color: fillColor }
    }
    return <ReactHighcharts isPureConfig={true} config={config} ref="timelineChart" />
  }
}
