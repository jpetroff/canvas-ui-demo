import React from "react"
import { IntentForm, ModelForm, SystemPromptForm, PromptTemplateForm, AddContextForm, UserPromptForm } from "./forms"

export const formMappings = {
	'ai-intent-form': {
		component: IntentForm,
		props: {
			canvasKey: 'ai-intent-form',
			value: '',
			className: 'col-start-1'
		}
	},
	'ai-choose-model': {
		component: ModelForm,
		props: {
			canvasKey: 'ai-choose-model',
			model: '',
			className: 'col-start-1',
			options: [
				{label:'ChatGPT 4', value: 'gpt-4', meta: 'Cloud-based'},
				{label:'ChatGPT 4o', value: 'gpt-40', meta: 'Cloud-based'},
				{label:'ChatGPT 3.5-turbo', value: 'gpt-turbo', meta: 'Cloud-based'},
				{label:'Llama3', value: 'l3', meta: 'Cloud-based'},
				{label:'Llama2', value: 'l2', meta: 'Local'},
				{label:'Falcon', value: 'falc', meta: 'Local'},
				{label:'Mistral', value: 'mist', meta: 'Local'},
				{label:'Mistral instruct', value: 'mist-instr', meta: 'Local'},
				{label:'Phi3', value: 'p3', meta: 'Local'}
			]
		}
	},
	'ai-system-prompt': {
		component: SystemPromptForm,
		props: {
			canvasKey: 'ai-system-prompt',
			value: '',
			className: 'col-start-1'
		}
	},
	'ai-prompt-template': {
		component: PromptTemplateForm,
		props: {
			canvasKey: 'ai-prompt-template',
			value: [`System: {{system}}`, `User: {{user}}`, `Answer: {{answer}}`].join(String.fromCharCode(13, 13)),
			variables: ['system', 'context', 'user', 'answer'],
			className: 'col-start-2 row-start-1'
		}
	},
	'ai-add-context': {
		component: AddContextForm,
		props: {
			canvasKey: 'ai-add-context',
			value: 'url',
			url: '',
			className: 'col-start-1',
			dataset: '',
			datasetOptions: [
				{label:'design library 52 books 2024-05-23', value: 'dlb52', meta: '52 documents'},
				{label:'SLA documentation 2024-02-02', value: 'sladoc', meta: '3 documents'},
				{label:'Acme knowledge base', value: 'kb', meta: '68 documents'}
			],
			embeddingOptions: [
				{label:'Salesforce/SFR-Embedding-Mistral', value: 'sfr-mistral', meta: '7.11B params · FP16'},
				{label:'nomic-ai/nomic-embed-text-v1.5', value: 'nomic', meta: '137M params · FP32'}
			],
			embedding: ''
		}
	},
	'ai-user-prompt': {
		component: UserPromptForm,
		props: {
			canvasKey: 'ai-user-prompt',
			value: ''
		}
	}
}