import React from 'react';

interface DashboardCardProps {
  customStyle?: React.CSSProperties;
  children: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ customStyle, children }) => {
  return (
    <div style={customStyle}>
      {children}
    </div>
  );
};

export default DashboardCard; 