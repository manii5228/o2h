const Button = ({ children, variant = 'primary', size = 'md', onClick, disabled, loading, type = 'button', className = '' }) => {
  const classes = `btn btn-${variant} ${size !== 'md' ? `btn-${size}` : ''} ${className}`.trim();
  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled || loading}>
      {loading && <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span>}
      {children}
    </button>
  );
};

export default Button;
