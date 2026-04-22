import React from "react";

export default class ResearchErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: "",
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : "Unknown render error",
    };
  }

  componentDidCatch(error, errorInfo) {
    const { areaName = "research_results" } = this.props;
    console.error(`[ResearchErrorBoundary] ${areaName} render failure`, {
      areaName,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      componentStack: errorInfo?.componentStack || null,
    });
  }

  render() {
    const { hasError, errorMessage } = this.state;
    const { styles, areaName = "Research results", children } = this.props;

    if (hasError) {
      return (
        <div style={styles.cardWide}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={{ margin: 0 }}>Research results unavailable</h3>
              <div style={{ color: "#8a94a6", marginTop: 4 }}>
                {areaName} hit a render error and was contained safely.
              </div>
            </div>
          </div>
          <div style={{ color: "#f4f7ff", lineHeight: 1.7 }}>
            This analysis payload loaded, but one research section failed while rendering. Refresh the page or run the analysis again.
          </div>
          <div style={{ color: "#8a94a6", marginTop: 12 }}>
            Error: {errorMessage || "Unknown render error"}
          </div>
        </div>
      );
    }

    return children;
  }
}
