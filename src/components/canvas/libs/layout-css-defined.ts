import { extend } from "lodash"

export default function (currentCoords: ICanvasContainerCoords[]): ICanvasContainerCoords[] {
	const result : ICanvasContainerCoords[] = []

	currentCoords.map( (elementCoords, index) => {

		result.push(
			extend(elementCoords, {
				moduleX: 0,
				moduleY: 0
			})
		)

	})
	return result 
}