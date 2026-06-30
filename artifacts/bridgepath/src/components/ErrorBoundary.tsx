import { Component, type ReactNode } from "react";

const CORAL = "#C8461A";
const NAVY  = "#0C1A33";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  inline?: boolean;
  resetKey?: unknown;
}
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[Bridgepath] Render error:", error.message, info.componentStack);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    if (this.props.inline) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center rounded-xl border border-red-100 bg-red-50">
          <span className="text-3xl">⚠️</span>
          <p className="font-semibold text-sm" style={{ color: NAVY }}>
            This section failed to load
          </p>
          <p className="text-xs text-gray-500">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-1 text-xs font-bold px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: CORAL }}
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <div
        className="min-h-screen flex items-center justify-center px-5 py-24"
        style={{ backgroundColor: "#FEF9F4" }}
      >
        <div className="max-w-lg w-full text-center">
          <span
            className="block text-[7rem] font-extrabold leading-none select-none"
            style={{
              fontFamily: "var(--app-font-display)",
              color: CORAL,
              opacity: 0.15,
            }}
          >
            500
          </span>
          <h1
            className="text-3xl font-bold mb-3 -mt-8"
            style={{ fontFamily: "var(--app-font-display)", color: NAVY }}
          >
            Something went wrong
          </h1>
          <p className="text-[#7A6A5A] mb-8 leading-relaxed">
            An unexpected error occurred. Our team has been notified. Please refresh the page.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white text-sm"
              style={{ backgroundColor: CORAL, fontFamily: "var(--app-font-display)" }}
            >
              Refresh page
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm border-2"
              style={{ borderColor: NAVY, color: NAVY, fontFamily: "var(--app-font-display)" }}
            >
              Back to home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
