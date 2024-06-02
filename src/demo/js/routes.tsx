import * as React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Header from '@apps/header'
import Sidebar from '@apps/sidebar'

/* PAGES */
import PageIndex from '@pages/index'
import PageAi from '@pages/ai'

export default function createRouter() {

  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <div className=" gradient-bg w-screen h-dvh grid grid-cols-[theme(spacing.72)_1fr] grid-rows-[theme(spacing.16)_1fr]">
          <Header className="col-span-2" />
          <Sidebar className="">
          </Sidebar>
          <PageIndex />
        </div>),
    },
    {
      path: '/ai',
      element: (
        <div className=" gradient-bg w-screen h-dvh grid grid-cols-[theme(spacing.72)_1fr] grid-rows-[theme(spacing.16)_1fr]">
          <Header className="col-span-2" />
          <Sidebar className="">
          </Sidebar>
          <PageAi />
        </div>)
    }
  ])

  return router
}