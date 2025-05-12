import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import "./ButtonStyles.css"; // Import your CSS file

const IconButton = forwardRef(({ type, icon, text, onClick, className, tooltip, loading, disabled }, ref) => {
  return (
    <div className="g-btn">
      <button
        ref={ref} 
        type={type} // ✅ Now supports submit, button, and reset
        className={`icon-button hover-left-to-right ${className}`}
        onClick={!disabled ? onClick : undefined} // Prevent click when disabled
        title={tooltip}
        disabled={disabled} // ✅ Properly applies the disabled attribute
      >
        {loading ? (
          <i className="fa fa-spinner fa-spin"></i> // ✅ Show loader when loading
        ) : (
          <i className={icon}></i>
        )}
        {text && <span className="button-text">{text}</span>}
      </button>
    </div>
  );
});

IconButton.propTypes = {
  type: PropTypes.oneOf(["button", "submit", "reset"]), // ✅ Define accepted types
  icon: PropTypes.string.isRequired,
  text: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
  tooltip: PropTypes.string,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
};

IconButton.defaultProps = {
  type: "button", // ✅ Default type is button
  text: "",
  className: "",
  tooltip: "",
  loading: false,
  disabled: false,
};

export default IconButton;
