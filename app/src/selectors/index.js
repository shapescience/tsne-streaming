import { createSelector } from 'reselect'
import { List } from 'immutable'

export const getSamples = state => state.get('samples').toList() // it better not change the adress..
export const getVolume = createSelector(
    getSamples,
    samples => {
      if(samples.count() == 0) return [];
      const samples_ = samples.toList().toJS()
      const dates = samples_.map(e=>e.t)
      dates.sort((a,b)=>a-b)
      const agg_period = 1 * 60 * 1000
      const hours = (d) => Math.round(d / agg_period)
      const minH = hours(dates[0])
      const maxH = hours(dates[dates.length-1])
      const perHour = new Array(maxH-minH).fill(0)
      dates.forEach((date, idx, arr)=>{
        const pos = hours(date) - minH
        perHour[pos] = (perHour[pos]||0) + 1
        perHour[pos+1] = perHour[pos+1]||0
      })
      return perHour.map((q,i) => [ agg_period * (minH + i), q])
    }
)
