const fs = require('fs');
let code = fs.readFileSync('src/pages/Holdings.jsx', 'utf-8');

const target = `                            <div>
                                <span className="eyebrow">Diversification</span>
                                <h2>Sector Allocation</h2>
                            </div>
                        </div>
                        <ul className="legend-list padded">
                            {sectorDistribution.map((sector, index) => (
                                <li key={sector.sector}>`;

const replacement = `                            <div>
                                <span className="eyebrow">Diversification</span>
                                <h2>Sector Allocation</h2>
                            </div>
                        </div>
                        <div className="donut-wrap">
                            {sectorDistribution.length ? (
                                <div className="chart-frame chart-frame-sm">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={sectorDistribution}
                                                dataKey="value"
                                                nameKey="sector"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={48}
                                                outerRadius={72}
                                                paddingAngle={2}
                                                stroke="none"
                                            >
                                                {sectorDistribution.map((entry, index) => (
                                                    <Cell key={entry.sector} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(value)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : null}
                            <ul className="legend-list padded">
                                {sectorDistribution.map((sector, index) => (
                                    <li key={sector.sector}>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/Holdings.jsx', code);
