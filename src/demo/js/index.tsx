import '../style.css'
import '../index.html'
require.context('../assets/', true)


import * as React from 'react'
import { createRoot } from 'react-dom/client'
import createRouter from './routes'
import { RouterProvider } from 'react-router-dom'
import { AppContextProvider, getInitAppContext } from './context'

import { Theme } from '@radix-ui/themes'


async function main() {
	const appContext = await getInitAppContext()

	const router = createRouter()

	const root = createRoot(document.getElementById('react-app'))
	root.render(
		// <React.StrictMode>
		<Theme grayColor='slate' appearance='light' accentColor='violet'>
			<AppContextProvider initValue={appContext}>
				<RouterProvider router={router} />
			</AppContextProvider>
		</Theme>
		// </React.StrictMode>
	)
}

main()


