const fs = require('fs');
let code = fs.readFileSync('src/pages/Holdings.jsx', 'utf-8');

const target = `                                </li>
                            ))}
                            {!sectorDistribution.length ? <li className="muted">No sector data.</li> : null}
                        </ul>
                    </div>

                    {bestPerformer ? (`;

const replacement = `                                </li>
                            ))}
                            {!sectorDistribution.length ? <li className="muted">No sector data.</li> : null}
                            </ul>
                        </div>
                    </div>

                    {bestPerformer ? (`;

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/Holdings.jsx', code);
