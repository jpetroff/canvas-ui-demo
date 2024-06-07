import React from "react"
import { ChatBlock, FChoice, FGoTo, FReply, FScript, FText } from "./forms"

export const formMappings = {
	'chat-flow-start': {
		component: ChatBlock,
		props: {
			canvasKey: 'chat-flow-start',
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
				canvasKey: `chat-flow-${index}`,
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
			choices: [],
			field: 'choice'
		}
	},
	'reply': {
		component: FReply,
		props: {
			choices: [],
			field: 'reply'
		}
	},
	'goto': {
		component: FGoTo,
		props: {
			existingFlows: [],
			value: '',
			field: 'goto'
		}
	},
	'script': {
		component: FScript,
		props: {
			existingFlows: [],
			value: '',
			choices: [],
			field: 'script'
		}
	}
}