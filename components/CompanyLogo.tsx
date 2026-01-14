
import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

interface CompanyLogoProps {
  logoUrl?: string;
  name: string;
  className?: string;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({ logoUrl, name, className = "h-10 w-10" }) => {
  const [imageError, setImageError] = useState(false);

  // If we have a logo URL and it hasn't errored, show the image
  if (logoUrl && !imageError) {
    return (
      <img 
        src={logoUrl} 
        alt={`${name} logo`} 
        className={`${className} object-contain`}
        onError={() => setImageError(true)}
      />
    );
  }

  // Fallback: Show initials on a nice background
  const initials = name
    .replace(/[^a-zA-Z0-9 ]/g, '') // Remove special chars
    .split(' ')
    .filter(w => w.length > 0)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Generate a consistent color based on name length/char code to avoid random flickering
  const colors = [
    'bg-slate-100 text-slate-600',
    'bg-indigo-50 text-indigo-600',
    'bg-blue-50 text-blue-600',
    'bg-emerald-50 text-emerald-600',
  ];
  const colorIndex = name.length % colors.length;
  const colorClass = colors[colorIndex];

  return (
    <div className={`${className} ${colorClass} rounded-lg flex items-center justify-center font-bold text-xs select-none border border-black/5`}>
      {initials ? (
        <span>{initials}</span>
      ) : (
        <Building2 className="h-1/2 w-1/2 opacity-50" />
      )}
    </div>
  );
};

export default CompanyLogo;
