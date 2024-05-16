import { extend } from "lodash"
import { ICanvasCoordsCollection } from "../types"

export default function (currentCoords: ICanvasCoordsCollection): ICanvasCoordsCollection {
	const result : ICanvasCoordsCollection = {}

	// currentCoords.map( (elementCoords, index) => {

	// 	result.push(
	// 		extend(elementCoords, {
	// 			moduleX: 0,
	// 			moduleY: 0
	// 		})
	// 	)

	// })
	return currentCoords 
}