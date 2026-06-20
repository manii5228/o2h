const Badge = ({ type, text }) => {
  const className = `badge badge-${type.toLowerCase().replace(/\s+/g, '')}`;
  return <span className={className}>{text || type}</span>;
};

export default Badge;
