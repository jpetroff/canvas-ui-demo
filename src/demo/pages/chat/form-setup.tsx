import React from "react"
import { ChatBlock, FChoice, FText } from "./forms"

export const formMappings = {
	'chat-form-start': {
		component: ChatBlock,
		props: {
			canvasKey: 'chat-form-start',
			content: [
				{
					field: 'text',
					value: '',
					label: 'Greet user with text:'
				}
			],
		}
	},
	'default': (index) => {
		return {
			component: ChatBlock,
			props: {
				canvasKey: `chat-form-${index}`,
				content: [],
			}
		}
	}
}

export const fieldMappings = {
	'text': {
		component: FText,
		props: {
			value: '',
			field: 'text'
		}
	},
	'choice': {
		component: FChoice,
		props: {
			choices: [ {value: '' } ],
			field: 'choice'
		}
	}
}