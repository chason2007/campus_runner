import { useState, useEffect } from 'react';
import { api } from '../utils/api';

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

    if (loading) return <div>Loading leaderboard...</div>;

    return (
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem', margin: 0, color: 'var(--accent)' }}>🔥 Runner Leaderboard</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Top 10 This Month</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {entries.length > 0 ? entries.map((entry, index) => (
                    <div
                        key={entry._id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            background: index === 0 ? 'rgba(0,212,255,0.05)' : 'transparent',
                            borderRadius: '12px',
                            border: index === 0 ? '1px solid var(--accent3)' : '1px solid transparent',
                            transition: 'transform 0.2s',
                            cursor: 'default'
                        }}
                    >
                        <div style={{ width: '24px', fontWeight: 800, color: index < 3 ? 'var(--accent)' : 'var(--text3)', fontSize: '1rem' }}>
                            #{index + 1}
                        </div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg2)', margin: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                            {entry.avatar ? <img src={entry.avatar} alt={entry.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : entry.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{entry.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{entry.completedDeliveries} Deliveries</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, color: 'var(--accent)' }}>AED {entry.totalEarnings}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase' }}>Earned</div>
                        </div>
                    </div>
                )) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)' }}>No data available yet.</div>
                )}
            </div>
        </div>
    );
}
