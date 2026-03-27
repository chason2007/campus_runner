import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Skeleton, SkeletonCircle } from './Skeleton';

interface LeaderboardEntry {
    _id: string;
    name: string;
    completedDeliveries: number;
    totalEarnings: number;
    avatar?: string;
}

export default function Leaderboard() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await api.runners.getLeaderboard();
                setEntries(data);
            } catch (err) {
                console.error('Failed to fetch leaderboard', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const LeaderboardSkeleton = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: 'transparent', borderRadius: '12px', border: '1px solid transparent' }}>
                    <Skeleton width="24px" height="20px" />
                    <SkeletonCircle width="40px" height="40px" style={{ margin: '0 16px' }} />
                    <div style={{ flex: 1 }}>
                        <Skeleton width="60%" height="16px" style={{ marginBottom: '8px' }} />
                        <Skeleton width="40%" height="12px" />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <Skeleton width="60px" height="16px" style={{ marginBottom: '8px' }} />
                        <Skeleton width="40px" height="10px" />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="glass" style={{ borderRadius: '16px', padding: '24px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', margin: 0, color: 'var(--accent)' }}>🔥 Runner Leaderboard</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Top 10 This Month</span>
            </div>

            {loading ? (
                <LeaderboardSkeleton />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {entries.length > 0 ? entries.map((entry, index) => {
                        const getRank = (count: number) => {
                            if (count >= 100) return { name: 'Diamond', color: '#b9f2ff', glow: '0 0 15px #b9f2ff' };
                            if (count >= 31) return { name: 'Gold', color: '#ffd700', glow: '0 0 10px #ffd700' };
                            if (count >= 11) return { name: 'Silver', color: '#c0c0c0', glow: '0 0 8px #c0c0c0' };
                            return { name: 'Bronze', color: '#cd7f32', glow: 'none' };
                        };
                        const rank = getRank(entry.completedDeliveries);

                        return (
                            <div
                                key={entry._id}
                                className={rank.name === 'Diamond' ? 'shimmer-card' : ''}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    background: index === 0 ? 'rgba(0,212,255,0.05)' : 'transparent',
                                    borderRadius: '12px',
                                    border: index === 0 ? '1px solid var(--accent)' : '1px solid transparent',
                                    transition: 'transform 0.2s',
                                    cursor: 'default',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ width: '24px', fontWeight: 800, color: index < 3 ? 'var(--accent)' : 'var(--text3)', fontSize: '1rem' }}>
                                    #{index + 1}
                                </div>
                                <div style={{ 
                                    width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg2)', 
                                    margin: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    border: `2px solid ${rank.color}`, boxShadow: rank.glow 
                                }}>
                                    {entry.avatar ? <img src={entry.avatar} alt={entry.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : entry.name.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{entry.name}</div>
                                        <span style={{ 
                                            fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', 
                                            background: `${rank.color}20`, color: rank.color, border: `1px solid ${rank.color}40`,
                                            fontWeight: 700, textTransform: 'uppercase'
                                        }}>
                                            {rank.name}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{entry.completedDeliveries} Deliveries</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 700, color: 'var(--accent)' }}>AED {entry.totalEarnings}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Earned</div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)' }}>No data available yet.</div>
                    )}
                </div>
            )}
        </div>
    );
}
