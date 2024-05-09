import * as React from 'react'
import { createBrowserRouter } from 'react-router-dom'

/* PAGES */
import Index from '@pages/index'

export default function createRouter() {

  const router = createBrowserRouter([
    {
      path: '/',
      element: (<Index />),
    }
  ])

  return router
}