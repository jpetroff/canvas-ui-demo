import { extend } from "lodash"
import LayoutEngine from "./layout"

export default function (this: LayoutEngine, currentCoords: ICanvasContainerCoords[]): ICanvasContainerCoords[] {
	const result : ICanvasContainerCoords[] = []
		currentCoords.map( (elementCoords, index) => {
			const prevElementH = index > 0 ? currentCoords[index - 1].moduleH : 0
			result.push(
				extend(elementCoords, {
					moduleY: elementCoords.moduleY || this.layoutOptions.moduleGap + index * (this.layoutOptions.moduleGap + prevElementH),
					moduleX: elementCoords.moduleX || this.layoutOptions.moduleGap
				})
			)
		})
		return result 
}