import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
  title,
  subtitle,
  image,
  actions,
  children,
  elevation = 1,
  variant = 'default',
  className = '',
  onClick,
  ...rest
}) => {
  const cardClasses = `
    card
    card--${variant}
    card--elevation-${elevation}
    ${className}
  `.trim();

  const handleCardClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      className={cardClasses}
      onClick={handleCardClick}
      {...rest}
    >
      {image && (
        <div className="card__image-container">
          <img src={image.src} alt={image.alt || ''} className="card__image" />
        </div>
      )}

      <div className="card__content">
        {title && <h3 className="card__title">{title}</h3>}
        {subtitle && <h4 className="card__subtitle">{subtitle}</h4>}

        {children && (
          <div className="card__body">
            {children}
          </div>
        )}
      </div>

      {actions && actions.length > 0 && (
        <div className="card__actions">
          {actions.map((action, index) => (
            <React.Fragment key={index}>
              {action}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  image: PropTypes.shape({
    src: PropTypes.string.isRequired,
    alt: PropTypes.string
  }),
  actions: PropTypes.arrayOf(PropTypes.node),
  children: PropTypes.node,
  elevation: PropTypes.oneOf([0, 1, 2, 3, 4, 5]),
  variant: PropTypes.oneOf(['default', 'outlined', 'contained']),
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default Card;