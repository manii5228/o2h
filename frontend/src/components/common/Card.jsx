const Card = ({ children, className = '', lift = false, onClick }) => {
  return (
    <div className={`card ${lift ? 'card-lift' : ''} ${className}`} onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
      {children}
    </div>
  );
};

export default Card;
