import { Outlet } from 'react-router-dom'
import Topbar from '../components/layout/Topbar'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-700">
      <Topbar />
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}