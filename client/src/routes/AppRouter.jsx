import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import MarketingLayout from '../layouts/MarketingLayout'
import AppLayout from '../layouts/AppLayout'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { getRoleHome } from '../utils/roles'
import Home from '../pages/marketing/Home'
import About from '../pages/marketing/About'
import Contact from '../pages/marketing/Contact'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import NotFound from '../pages/NotFound'
import MyClaims from '../pages/patient/MyClaims'
import SubmitClaimStep1 from '../pages/patient/SubmitClaimStep1'
import UploadDocumentsStep2 from '../pages/patient/UploadDocumentsStep2'
import ClaimDetail from '../pages/patient/ClaimDetail'
import ClaimsDashboard from '../pages/insurer/ClaimsDashboard'

function AuthLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size={24} className="text-violet-600" />
    </div>
  )
}

function RequireGuest({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) return <AuthLoading />
  if (isAuthenticated) return <Navigate to={getRoleHome(user?.role)} replace />
  return children
}

function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <AuthLoading />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}

function RequireRole({ role, children }) {
  const { user } = useAuth()

  return (
    <RequireAuth>
      {user?.role === role ? children : <Navigate to={getRoleHome(user?.role)} replace />}
    </RequireAuth>
  )
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/login"
          element={
            <RequireGuest>
              <Login />
            </RequireGuest>
          }
        />
        <Route
          path="/register"
          element={
            <RequireGuest>
              <Register />
            </RequireGuest>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route
          path="/patient"
          element={
            <RequireRole role="PATIENT">
              <Outlet />
            </RequireRole>
          }
        >
          <Route index element={<MyClaims />} />
          <Route path="claims/new" element={<SubmitClaimStep1 />} />
          <Route path="claims/:id/upload" element={<UploadDocumentsStep2 />} />
          <Route path="claims/:id" element={<ClaimDetail />} />
        </Route>
        <Route
          path="/insurer"
          element={
            <RequireRole role="INSURER">
              <ClaimsDashboard />
            </RequireRole>
          }
        />
      </Route>
    </Routes>
  )
}