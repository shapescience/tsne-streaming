import { hsl } from 'd3-color'
export const palette = (l, l_max=9, lightness=0.8, opacity=0.8) => {
  if (l === -1 ){
    return 'rgb(188, 188, 188)'
  } else {
    return hsl(l*360/l_max, 0.9, lightness, opacity).toString()
  }
}
