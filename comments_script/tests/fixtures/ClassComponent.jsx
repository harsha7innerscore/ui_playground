import React from 'react';

class Button extends React.Component {
  state = {
    isClicked: false,
    hoverState: null
  };

  handleClick = () => {
    this.setState(prevState => ({
      isClicked: !prevState.isClicked
    }));

    if (this.props.onClick) {
      this.props.onClick();
    }
  };

  handleMouseEnter = () => {
    this.setState({ hoverState: 'hover' });
  };

  handleMouseLeave = () => {
    this.setState({ hoverState: null });
  };

  render() {
    const {
      label,
      className,
      disabled,
      variant = 'primary',
      size = 'medium'
    } = this.props;

    const buttonClasses = `
      button
      button--${variant}
      button--${size}
      ${this.state.isClicked ? 'button--clicked' : ''}
      ${this.state.hoverState === 'hover' ? 'button--hover' : ''}
      ${className || ''}
    `.trim();

    return (
      <button
        className={buttonClasses}
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        disabled={disabled}
        type="button"
      >
        <span className="button__label">{label}</span>
        {this.props.children && (
          <div className="button__children">
            {this.props.children}
          </div>
        )}
      </button>
    );
  }
}

export default Button;