import React from 'react';
import './Library.css';

const VCUserAvatar = ({ 
  user, 
  size = 'medium',
  showName = true 
}) => {
  const { name, avatar_url, id } = user || {};
  
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSizeClass = (size) => {
    switch (size) {
      case 'small': return 'avatar-sm';
      case 'large': return 'avatar-lg';
      default: return 'avatar-md';
    }
  };

  return (
    <div className={`vc-user-avatar ${getSizeClass(size)}`}>
      <div className="avatar-image">
        {avatar_url ? (
          <img 
            src={avatar_url} 
            alt={name || 'User avatar'}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="avatar-initials"
          style={{ display: avatar_url ? 'none' : 'flex' }}
        >
          {getInitials(name)}
        </div>
      </div>
      
      {showName && name && (
        <span className="avatar-name">{name}</span>
      )}
    </div>
  );
};

export default VCUserAvatar;