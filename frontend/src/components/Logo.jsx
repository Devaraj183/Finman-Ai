import React from 'react';

const Logo = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="48" fill="url(#glowGrad)" opacity="0.15" />
    <polygon points="50,15 50,85 15,45" fill="url(#gradLeft)" />
    <polygon points="50,15 85,45 50,85" fill="url(#gradRight)" />
    <path d="M 20 60 Q 40 25, 55 55 T 85 25" fill="none" stroke="url(#trendGrad)" strokeWidth="7" strokeLinecap="round" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))' }} />
    <defs>
      <linearGradient id="glowGrad" x1="0" y1="0" x2="100" y2="100">
        <stop offset="0%" stopColor="#10b981"/>
        <stop offset="100%" stopColor="#059669"/>
      </linearGradient>
      <linearGradient id="gradLeft" x1="15" y1="45" x2="50" y2="85">
        <stop offset="0%" stopColor="#34d399"/>
        <stop offset="100%" stopColor="#059669"/>
      </linearGradient>
      <linearGradient id="gradRight" x1="50" y1="15" x2="85" y2="85">
        <stop offset="0%" stopColor="#059669"/>
        <stop offset="100%" stopColor="#064e3b"/>
      </linearGradient>
      <linearGradient id="trendGrad" x1="20" y1="60" x2="85" y2="25">
        <stop offset="0%" stopColor="#fbbf24"/>
        <stop offset="100%" stopColor="#f59e0b"/>
      </linearGradient>
    </defs>
  </svg>
);

export default Logo;
