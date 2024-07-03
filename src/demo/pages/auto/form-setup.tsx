import React from "react"
import { StartBlock, StepBlock } from "./forms"
import { randomUUID } from "crypto"
// import { } from "./forms"

export const formMappings = {
	'start-block': {
		component: StartBlock,
		props: {
			canvasKey: 'start-block',
			scenario: '',
			connections: []
		}
	},
	'default': () => {
		return {
			component: StepBlock,
			props: {
				canvasKey: 'auto-step-'+createRandomString(24),
				connections: [],
				type: 'check',
				branches: [{op: 'not empty', connection: null, value: ''}]
			}
		}
	}
}


function createRandomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const DATABASE_LIST = [
	{value: 'd1', label: 'Employee payroll'},
	{value: 'd2', label: 'Employee schedules'},
	{value: 'd3', label: 'Public holidays'},
	{value: 'd4', label: 'Org chart'},
]

export const DATABASE_PROPS = {
	'd1': ['Monthly salary', 'Annual salary', 'Overtime pay', 'Bonuses total'],
	'd2': ['Accrued holidays', 'Sick leave days', 'Unpaid leave days', 'Working hours per week', 'Employment start', 'Approved absense', 'Requested absense'],
	'd3': [],
	'd4': ['Employee superior', 'Payroll category', 'Employee department', 'Employee reports', 'Contract type'],
}

export function fieldType(field: string) {
	if(
		['Payroll category', 'Employee department', 'Contract type'].indexOf(field) != -1
	) 
		return 'string'

	if(
		['Employee superior', 'Employee reports'].indexOf(field) != -1
	)
		return 'user'

	if(
		['Approved absense', 'Requested absense'].indexOf(field) != -1
	)
		return 'date'

	return 'number'
}

export function fieldOp(type?: string) {
	switch(type) {
		case 'string': return ['equal', 'contains', 'not empty', 'empty'];
		case 'number': return ['=', '>', '<', 'not empty'];
		case 'user': return ['not empty'];
		case 'date': return ['not empty', 'overlap with', 'not overlap with', 'total days >', 'total days <'];
		default: return ['equal', 'contains', 'not empty', 'empty', '=', '>', '<']
	}
}

