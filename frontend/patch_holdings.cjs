const fs = require('fs');
let code = fs.readFileSync('src/pages/Holdings.jsx', 'utf-8');

code = code.replace(
`                        <div className="donut-wrap">
                            {stockAllocation.length ? (
                                <ResponsiveContainer height="100%" width="100%">`,
`                        <div className="donut-wrap">
                            {stockAllocation.length ? (
                                <div className="chart-frame chart-frame-sm">
                                <ResponsiveContainer height="100%" width="100%">`
);

code = code.replace(
`                                        <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (`,
`                                        <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                                </div>
                            ) : (`
);

fs.writeFileSync('src/pages/Holdings.jsx', code);
