import * as React from 'react'
import { isEqual } from 'lodash'
import { start } from 'repl'

export type IConnectorProps = {
	top: number
	left: number
	w: number
	h: number
	start: [number, number],
	end: [number, number],
}

const Connector = React.memo<IConnectorProps>( 
	(props) => {
		const ref = React.useRef(null)
		const _r = Math.round

		const padding = 8

		const top = _r(props.top) - padding
		const left = _r(props.left) - padding

		const w = _r(props.w) + 2*padding
		const h = _r(props.h) + 2*padding

		const style = {
			top: top+'px',
			left: left+'px'
		}

		React.useEffect(
			() => {
				const canvas = ref.current
				const ctx = canvas.getContext('2d')
				
				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
				ctx.beginPath()

				ctx.lineWidth = 2
				ctx.strokeStyle = "#818cf8"

				const start = [
					_r(props.start[0]) + padding,
					_r(props.start[1]) + padding
				]

				const end = [
					_r(props.end[0]) + padding,
					_r(props.end[1]) + padding
				]

				console.log(props.start, props.end)
				console.log(start, end)

				const cpStart = [ 
					_r(props.end[0] + padding), 
					_r(props.start[1]) + padding 
				]
				const cpEnd = [ 
					_r( props.start[0] + padding ), 
					_r(props.end[1]) + padding 
				]

				ctx.moveTo(...start)
				if(props.h >= 16) {
					ctx.bezierCurveTo(...cpStart, ...cpEnd, ...end)
				} else {
					ctx.lineTo(...end)
				}
				ctx.stroke()

				ctx.fillStyle = "#818cf8"
				ctx.beginPath()
				ctx.arc(...start, 6, 0, 2 * Math.PI)
				ctx.fill()

				ctx.fillStyle = "#818cf8"
				ctx.beginPath()
				ctx.arc(...end, 6, 0, 2 * Math.PI)
				ctx.fill()
			}
		)

		return <canvas height={h} width={w} className='absolute pointer-events-none' ref={ref} style={style} />
	},
	(prevProps, nextProps) => {
		return isEqual(prevProps, nextProps)
	}
)

export default Connector;