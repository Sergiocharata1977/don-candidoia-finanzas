import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'md',
  showText = true,
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const textColor = variant === 'light' ? 'text-white' : 'text-slate-900';

  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0`}
      >
        <svg
          className="w-3/5 h-3/5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
      {showText && (
        <span
          className={`font-bold ${textClasses[size]} ${textColor} whitespace-nowrap`}
        >
          Don Cándido
        </span>
      )}
    </Link>
  );
};

export default Logo;
