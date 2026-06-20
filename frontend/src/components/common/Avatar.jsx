const colors = ['#a91f23', '#22346c', '#0080c7', '#c9503d', '#27bcd1'];

const Avatar = ({ name, size = '', src }) => {
  if (src) {
    return <img src={src} alt={name} className={`avatar ${size ? `avatar-${size}` : ''}`} style={{ objectFit: 'cover' }} />;
  }
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  return (
    <div className={`avatar ${size ? `avatar-${size}` : ''}`} style={{ background: colors[colorIndex] }}>
      {initials}
    </div>
  );
};

export default Avatar;
