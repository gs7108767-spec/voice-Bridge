import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center font-mono">
                    <h1 className="text-red-500 text-3xl font-bold mb-4">Something went wrong.</h1>
                    <div className="bg-gray-800 p-6 rounded-lg max-w-3xl overflow-auto border border-red-900">
                        <h2 className="text-xl text-red-300 mb-2">{this.state.error && this.state.error.toString()}</h2>
                        <pre className="text-sm text-gray-400 whitespace-pre-wrap">
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-3 bg-brand-500 hover:bg-brand-600 rounded-lg font-bold"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
