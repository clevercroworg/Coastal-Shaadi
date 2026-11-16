import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem('userProfile');
    } catch (e) {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center">
          <div role="alert" className="glass-panel p-8 rounded-2xl max-w-lg w-full border border-gray-100 shadow-xl">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 text-accent-dark font-serif font-bold text-2xl">
              CS
            </div>
            <h2 className="text-xl font-serif font-bold text-gray-900 mb-2">This page needs a quick refresh</h2>
            <p className="text-sm text-gray-600 mb-6">
              Sorry for the interruption. Your profile and details are safe. Please refresh to continue, and if this keeps happening, our support team is happy to help.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors shadow-md"
            >
              Refresh Page
            </button>
            <a
              href="/contact"
              className="block mt-3 text-sm font-medium text-primary hover:underline"
            >
              Contact Support
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
