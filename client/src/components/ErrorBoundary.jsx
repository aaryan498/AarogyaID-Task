import { Component } from 'react'
import Card from './ui/Card'
import ErrorState from './ui/ErrorState'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="mx-auto w-full max-w-md px-4 py-16 sm:py-24">
        <Card>
          <ErrorState
            message="Something went wrong. Please refresh the page and try again."
            onRetry={() => window.location.reload()}
          />
        </Card>
      </main>
    )
  }
}