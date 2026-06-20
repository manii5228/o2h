const Loader = ({ type = 'spinner' }) => {
  if (type === 'skeleton') {
    return (
      <div style={{ padding: '24px' }}>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-text" style={{ width: '90%' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '75%' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '85%' }}></div>
      </div>
    );
  }
  return (
    <div className="loader">
      <div className="spinner"></div>
    </div>
  );
};

export default Loader;
