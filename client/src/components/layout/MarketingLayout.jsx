import { Outlet } from 'react-router-dom'
import Topbar from '../components/layout/Topbar'
import Footer from '../components/layout/Footer'

export default function MarketingLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-700">
      <Topbar />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}