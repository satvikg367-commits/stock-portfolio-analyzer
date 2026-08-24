function StatCard({ icon, label, value, hint, tone = "neutral", trend }) {
    return (
        <article className={`stat-card tone-${tone}`}>
            <div className="stat-card-top">
                <span className="stat-label">{label}</span>
                <span className="material-symbols-outlined stat-icon">{icon}</span>
            </div>
            <strong className="stat-value">{value}</strong>
            <div className="stat-card-footer">
                {trend ? (
                    <span className={`stat-trend ${trend.tone || tone}`}>
                        <span className="material-symbols-outlined">
                            {trend.tone === "negative" ? "trending_down" : trend.tone === "positive" ? "trending_up" : "trending_flat"}
                        </span>
                        {trend.label}
                    </span>
                ) : null}
                {hint ? <span className="stat-hint">{hint}</span> : null}
            </div>
        </article>
    );
}

export default StatCard;
