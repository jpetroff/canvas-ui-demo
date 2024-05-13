import { extend } from "lodash"

export default function (currentCoords: ICanvasContainerCoords[]): ICanvasContainerCoords[] {
	const result : ICanvasContainerCoords[] = []
		currentCoords.map( (elementCoords, index) => {
			const prevElementW = index > 0 ? currentCoords[index - 1].moduleW : 0
			result.push(
				extend(elementCoords, {
					moduleX: elementCoords.moduleX || this.layoutOptions.moduleGap + index * (this.layoutOptions.moduleGap + prevElementW),
					moduleY: elementCoords.moduleY || this.layoutOptions.moduleGap
				})
			)
		})
		return result 
}