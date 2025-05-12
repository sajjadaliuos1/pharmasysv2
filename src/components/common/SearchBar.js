
import React from "react";
import PropTypes from "prop-types";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ value, onChange, placeholder, className }) => {
  return (
    <div className={`input-group search-area ${className}`}>
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="input-group-text">
        <button className="bg-transparent border-0" type="button">
          <FaSearch />
        </button>
      </span>
    </div>
  );
};

SearchBar.propTypes = {
  value: PropTypes.string.isRequired, // The current value of the search bar
  onChange: PropTypes.func.isRequired, // Callback to handle input changes
  placeholder: PropTypes.string, // Placeholder text for the search bar
  className: PropTypes.string, // Additional classes for styling
};

SearchBar.defaultProps = {
  placeholder: "Search here", // Default placeholder
  className: "", // No additional classes by default
};

export default SearchBar;
