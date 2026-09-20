import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/ui/Toast'
import AppRouter from './routes/AppRouter'

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <AppRouter />
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App