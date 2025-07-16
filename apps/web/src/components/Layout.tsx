import { Outlet } from 'react-router'
import { Helmet } from 'react-helmet-async'

export default function Layout() {
  return (
    <>
      <Helmet>
        <title>ミルタス</title>
        <meta name="description" content="ミルタス - 認証" />
      </Helmet>
      <div className="flex h-screen bg-background">
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
      </div>
    </>
  )
}