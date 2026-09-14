import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
    loadPriceHistory,
    savePriceHistory,
    shouldFireToast,
} from "../utils/charts";
import { formatCurrency, getStockPrice } from "../utils/format";

const LIVE_JUMP_THRESHOLD_PERCENT = 3;

function LiveMarketWatcher() {
    const { user } = useAuth();
    const alertsRef = useRef([]);
    const pricesRef = useRef({});

    useEffect(() => {
        if (!user?.id) {
            return;
        }

            api.get("/alerts", { silent: true })
            .then((res) => {
                alertsRef.current = res.data || [];
            })
            .catch(() => {
                alertsRef.current = [];
            });
    }, [user?.id]);

    useEffect(() => {
        let ignore = false;

        async function tick() {
            try {
                const response = await api.get("/stocks", { silent: true });
                if (ignore) {
                    return;
                }

                const nextStocks = response.data || [];
                const previousPrices = pricesRef.current;
                const nextHistory = { ...loadPriceHistory() };
                const nextPrices = { ...previousPrices };

                nextStocks.forEach((stock) => {
                    const nextPrice = Number(getStockPrice(stock));
                    const previousPrice = Number(previousPrices[stock.id]);
                    const series = Array.isArray(nextHistory[stock.id]) ? nextHistory[stock.id] : [];
                    nextHistory[stock.id] = [...series, nextPrice]
                        .filter((value) => Number.isFinite(value))
                        .slice(-24);
                    nextPrices[stock.id] = nextPrice;

                    if (!Number.isFinite(previousPrice) || !Number.isFinite(nextPrice) || previousPrice === 0) {
                        return;
                    }

                    const ratio = ((nextPrice - previousPrice) / previousPrice) * 100;
                    const jumpKey = `jump:${stock.id}:${ratio > 0 ? "up" : "down"}`;

                    if (Math.abs(ratio) >= LIVE_JUMP_THRESHOLD_PERCENT && shouldFireToast(jumpKey)) {
                        if (ratio > 0) {
                            toast.success(`📈 ${stock.symbol} is up ${ratio.toFixed(1)}%`, {
                                id: jumpKey,
                                duration: 4500,
                            });
                        } else {
                            toast.error(`📉 ${stock.symbol} dropped ${Math.abs(ratio).toFixed(1)}%`, {
                                id: jumpKey,
                                duration: 4500,
                            });
                        }
                    }

                    alertsRef.current
                        .filter((alert) => alert.active && alert.stock?.id === stock.id)
                        .forEach((alert) => {
                            const target = Number(alert.targetPrice);
                            if (!Number.isFinite(target)) {
                                return;
                            }

                            const condition = String(alert.condition || "ABOVE").toUpperCase();
                            let triggered = false;

                            if (condition === "ABOVE") {
                                triggered = previousPrice < target && nextPrice >= target;
                            } else if (condition === "BELOW") {
                                triggered = previousPrice > target && nextPrice <= target;
                            } else if (condition === "PERCENT") {
                                triggered = Math.abs(ratio) >= target;
                            }

                            const alertKey = `alert:${alert.id}:${stock.id}`;
                            if (triggered && shouldFireToast(alertKey, 120000)) {
                                toast.warning(`🔔 ${stock.symbol} crossed ${formatCurrency(nextPrice)}`, {
                                    id: alertKey,
                                    duration: 5000,
                                });
                            }
                        });
                });

                pricesRef.current = nextPrices;
                savePriceHistory(nextHistory);
                window.dispatchEvent(new CustomEvent("spa:prices", { detail: nextStocks }));
            } catch {
                // Keep existing API error toasts from the interceptor.
            }
        }

        tick();
        const timer = window.setInterval(tick, 15000);

        return () => {
            ignore = true;
            window.clearInterval(timer);
        };
    }, [user?.id]);

    return null;
}

export default LiveMarketWatcher;
