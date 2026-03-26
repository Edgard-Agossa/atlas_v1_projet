import React from 'react';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'primary' | 'purple' | 'gray' | 'blue' | 'teal' | 'orange';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-green-600 text-white',
  danger:  'bg-red-600 text-white',
  warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300',
  primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300',
  purple:  'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
  gray:    'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
  blue:    'bg-blue-600 text-white',
  teal:    'bg-teal-600 text-white',
  orange:  'bg-orange-600 text-white',
};

const Badge: React.FC<BadgeProps> = ({ label, variant = 'gray', className = '' }) => (
  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${variantClasses[variant]} ${className}`}>
    {label}
  </span>
);

export default Badge;
