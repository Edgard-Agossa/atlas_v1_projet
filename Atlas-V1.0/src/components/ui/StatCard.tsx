import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconBg?: string;       // ex: 'bg-primary-100 dark:bg-primary-900/20'
  iconColor?: string;    // ex: 'text-primary-600 dark:text-primary-400'
  valueColor?: string;   // ex: 'text-success-600'
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  iconBg = 'bg-primary-100 dark:bg-primary-900/20',
  iconColor = 'text-primary-600 dark:text-primary-400',
  valueColor = 'text-gray-900 dark:text-white',
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="card p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
        <p className={`text-2xl font-bold mt-2 ${valueColor}`}>{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${iconBg}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </div>
  </motion.div>
);

export default StatCard;
