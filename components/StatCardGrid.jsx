// components/StatCardGrid.jsx
'use client';
import React from 'react';
import StatCard from './StatCard';

export default function StatCardGrid({ leaders }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfig.map(({ key, title, field }) => {
        const leader = leaders[key];
        return (
          <StatCard
            key={key}
            title={title}
            player={leader.summonerName}
            value={leader[field]}
          />
        );
      })}
    </div>
  );
}
