// components/StatCard.jsx
'use client';
import React from 'react';

export default function StatCard({ title, player, value, }) {
  return (
    <div className="bg-gray-100 rounded-2xl shadow p-4 text-center">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 text-xl">{player}</p>
      <p className="mt-1 text-sm text-gray-600">{value}</p>
    </div>
  );
}