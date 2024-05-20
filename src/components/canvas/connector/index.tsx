import * as React from 'react'
import { isEqual } from 'lodash'
import { bezierControlPoint } from '../libs/utils'

export type IConnectorProps = {
	top: number
	left: number
	w: number
	h: number
	start: TConnectorPoint,
	end: TConnectorPoint,
}

export enum ConnectorAttachmentType {
	top = 't',
	bottom = 'b',
	left = 'l',
	right = 'r',
	topLeft = 'tl',
	topRight = 'tr',
	bottomLeft = 'bl',
	bottomRight = 'br'
}

const Connector = React.memo<IConnectorProps>( 
	(props) => {
		const ref = React.useRef(null)

		const padding = 16

		const top = props.top - padding
		const left = props.left - padding

		const w = props.w + 2*padding
		const h = props.h + 2*padding

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
					props.start.x + padding,
					props.start.y + padding
				]

				const end = [
					props.end.x + padding,
					props.end.y + padding
				]

				const cpStart = bezierControlPoint(props.start, ctx.canvas.width / 2, ctx.canvas.height / 2, padding)
				const cpEnd = bezierControlPoint(props.end, ctx.canvas.width / 2, ctx.canvas.height / 2, padding)

				ctx.moveTo(...start)
				if(props.h >= 16) {
					ctx.bezierCurveTo(...cpStart, ...cpEnd, ...end)
				} else {
					ctx.lineTo(...end)
				}
				ctx.stroke()

				ctx.fillStyle = "#818cf8"
				ctx.beginPath()
				ctx.arc(...start, 3, 0, 2 * Math.PI)
				ctx.fill()

				ctx.fillStyle = "#818cf8"
				ctx.beginPath()
				ctx.arc(...end, 3, 0, 2 * Math.PI)
				ctx.fill()
			}
		)

		return <canvas height={h} width={w} className='absolute pointer-events-none' ref={ref} style={style} />
	},
	(prevProps, nextProps) => {
		return isEqual(prevProps, nextProps)
	}
)

Connector.displayName = 'Canvas.Connector'

export default Connector;