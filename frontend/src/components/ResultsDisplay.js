import React from 'react';
import { useTranslation } from 'react-i18next';
import './ResultsDisplay.css';

const ResultsDisplay = ({ data }) => {
    const { t } = useTranslation();

    if (!data || !data.optimization) return null;

    const { optimization, results, metadata } = data;
    const { bestMandi, localMandi, extraProfit, recommendation, worthExtraDistance, perishability } = optimization;

    // Sort by distance and take only top 5 nearest
    const sortedByDistance = [...results].sort((a, b) => a.distance - b.distance);
    const nearestMandis = sortedByDistance.slice(0, 5);
    const totalMandis = results.length;

    return (
        <div className="results-container">
            <div className="results-header">
                <h2>🎯 {t('results.title')}</h2>
                <p className="results-subtitle">
                    {t('results.subtitle', { total: totalMandis, distance: metadata.maxDistanceKm })}
                </p>
            </div>

            {/* Perishability Alert */}
            {perishability?.bestMandi?.warning?.hasWarning && (
                <div className={`perishability-alert perishability-${perishability.bestMandi.warning.severity}`}>
                    <div className="alert-header">
                        <span className="alert-icon">{perishability.bestMandi.warning.icon}</span>
                        <span className="alert-title">{t('results.perishability.warning')}</span>
                    </div>
                    <p className="alert-message">{perishability.bestMandi.warning.message}</p>
                    <p className="alert-recommendation">{perishability.bestMandi.warning.recommendation}</p>

                    {perishability.bestMandi.spoilagePercentage > 0 && (
                        <div className="spoilage-details">
                            <div className="spoilage-stat">
                                <span className="spoilage-label">{t('results.perishability.spoilage')}:</span>
                                <span className="spoilage-value">{perishability.bestMandi.spoilagePercentage}%</span>
                            </div>
                            <div className="spoilage-stat">
                                <span className="spoilage-label">{t('results.perishability.potentialLoss')}:</span>
                                <span className="spoilage-value">₹{perishability.bestMandi.spoilageAmount?.toLocaleString()}</span>
                            </div>
                            {perishability.bestMandi.adjustedProfit !== undefined && (
                                <div className="spoilage-stat">
                                    <span className="spoilage-label">{t('results.perishability.adjustedProfit')}:</span>
                                    <span className="spoilage-value adjusted">₹{perishability.bestMandi.adjustedProfit.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {perishability.shouldConsiderLocal && perishability.localMandi && (
                        <div className="local-alternative">
                            <strong>💡 {t('results.perishability.localAlternative')}:</strong> {t('mandis.' + localMandi.name, localMandi.name)} at {localMandi.distance}km
                            has {perishability.localMandi.warning.severity} spoilage risk
                        </div>
                    )}
                </div>
            )}

            {/* Winner Card */}
            <div className="winner-card">
                <div className="winner-badge">
                    <span className="trophy">🏆</span>
                    <span>{t('results.winner.bestChoice')}</span>
                </div>
                <h3 className="winner-name">{t('mandis.' + bestMandi.name, bestMandi.name)}</h3>
                <div className="winner-stats">
                    <div className="stat-item">
                        <div className="stat-value">₹{bestMandi.netProfit.toLocaleString()}</div>
                        <div className="stat-label">{t('results.winner.netProfit')}</div>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <div className="stat-value">{bestMandi.distance} km</div>
                        <div className="stat-label">{t('results.winner.distance')}</div>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <div className="stat-value">₹{bestMandi.price}/Q</div>
                        <div className="stat-label">{t('results.winner.price')}</div>
                    </div>
                </div>

                {extraProfit > 0 && localMandi && (
                    <div className="extra-profit-badge">
                        <span className="badge-icon">💰</span>
                        {t('results.winner.extraProfit', { amount: extraProfit.toLocaleString(), localMandiName: t('mandis.' + localMandi.name, localMandi.name) })}
                    </div>
                )}
            </div>

            {/* Recommendation */}
            <div className="recommendation-card">
                <div className="recommendation-icon">💡</div>
                <p className="recommendation-text">
                    {(() => {
                        // Generate recommendation based on logic similar to backend
                        // This allows full translation support
                        if (!localMandi || bestMandi.name === localMandi.name) {
                            return t('results.recommendation.bestIsLocal', {
                                bestMandi: t('mandis.' + bestMandi.name, bestMandi.name)
                            });
                        }

                        if (extraProfit > 500) {
                            return t('results.recommendation.travelForProfit', {
                                bestMandi: t('mandis.' + bestMandi.name, bestMandi.name),
                                amount: Math.round(extraProfit).toLocaleString(),
                                localMandi: t('mandis.' + localMandi.name, localMandi.name)
                            });
                        } else if (extraProfit > 0) {
                            return t('results.recommendation.slightProfit', {
                                bestMandi: t('mandis.' + bestMandi.name, bestMandi.name),
                                amount: Math.round(extraProfit).toLocaleString(),
                                localMandi: t('mandis.' + localMandi.name, localMandi.name)
                            });
                        } else {
                            return t('results.recommendation.stickToLocal', {
                                localMandi: t('mandis.' + localMandi.name, localMandi.name)
                            });
                        }
                    })()}
                </p>
                {worthExtraDistance && worthExtraDistance.worth !== undefined && !worthExtraDistance.worth && (
                    <p className="recommendation-note">
                        ⚠️ {t('results.recommendation.notWorthExtraDistance')}
                    </p>
                )}
                {worthExtraDistance && worthExtraDistance.worth !== undefined && worthExtraDistance.worth && (
                    <p className="recommendation-note success">
                        ✅ {t('results.recommendation.worthExtraDistance', {
                            amount: worthExtraDistance.profitPerExtraKm
                        })}
                    </p>
                )}
            </div>

            {/* 5 Nearest Mandis */}
            <div className="all-results-section">
                <h3 className="section-title">
                    📍 {t('results.nearestList.title')}
                    <span className="mandi-count">{t('results.nearestList.sortedBy')}</span>
                </h3>
                <div className="results-grid">
                    {nearestMandis.map((result, index) => (
                        <div
                            key={index}
                            className={`result-card ${result.mandi === bestMandi.name ? 'best' : ''}`}
                        >
                            {result.mandi === bestMandi.name && (
                                <div className="best-tag">⭐ {t('results.nearestList.bestProfit')}</div>
                            )}
                            {localMandi && result.mandi === localMandi.name && result.mandi !== bestMandi.name && (
                                <div className="local-tag">📍 {t('results.nearestList.nearest')}</div>
                            )}
                            {index === 0 && result.mandi !== bestMandi.name && (
                                <div className="distance-tag">🎯 {t('results.nearestList.closest')}</div>
                            )}

                            <h4 className="result-mandi-name">{t('mandis.' + result.mandi, result.mandi)}</h4>

                            {result.volatilityAlert && (
                                <div className="volatility-alert">
                                    ⚠️ {t('results.nearestList.volatilityAlert')}
                                </div>
                            )}

                            {result.historicalTrend && (
                                <div className="historical-trend">
                                    📉 {t('trends.' + result.historicalTrend, result.historicalTrend)}
                                </div>
                            )}

                            <div className="result-details">
                                <div className="detail-row">
                                    <span className="detail-label">{t('results.winner.distance')}:</span>
                                    <span className="detail-value">{result.distance} {t('results.nearestList.km')}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">{t('results.winner.price')}:</span>
                                    <span className="detail-value">₹{result.price}{t('results.nearestList.perQ')}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">{t('results.nearestList.revenue')}:</span>
                                    <span className="detail-value green">₹{result.revenue.toLocaleString()}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">{t('results.nearestList.transportCost')}:</span>
                                    <span className="detail-value red">₹{result.transportCost.toLocaleString()}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">{t('results.nearestList.handlingCost')}:</span>
                                    <span className="detail-value red">₹{result.handlingCost.toLocaleString()}</span>
                                </div>
                                <div className="detail-row total">
                                    <span className="detail-label">{t('results.nearestList.totalCost')}:</span>
                                    <span className="detail-value red">₹{result.totalCost.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="result-profit">
                                <div className="profit-amount">₹{result.netProfit.toLocaleString()}</div>
                                <div className="profit-label">{t('results.winner.netProfit')}</div>
                                <div className="profit-percentage">{result.profitPercentage}% {t('results.nearestList.margin')}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ResultsDisplay;
