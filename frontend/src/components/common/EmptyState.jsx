import Button from './Button';

const EmptyState = ({ icon = '📋', title, message, actionText, onAction }) => {
  return (
    <div className="empty-state fade-in">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-text">{message}</p>
      {actionText && onAction && (
        <Button onClick={onAction}>{actionText}</Button>
      )}
    </div>
  );
};

export default EmptyState;
