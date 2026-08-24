import { buildSparklinePath } from "../utils/charts";

function Sparkline({ points = [], width = 72, height = 22, positive = true, className = "" }) {
    const path = buildSparklinePath(points, width, height);
    const stroke = positive ? "var(--green)" : "var(--red)";

    if (!path) {
        return <span className="sparkline-empty">—</span>;
    }

    return (
        <svg
            aria-hidden="true"
            className={`sparkline ${className}`}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            width={width}
        >
            <path d={path} style={{ stroke }} />
        </svg>
    );
}

export default Sparkline;
