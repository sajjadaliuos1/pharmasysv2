
import React from "react";
import PropTypes from "prop-types";
import { FixedSizeList } from "react-window";

const VirtualizedList = ({ items, height, itemSize, renderRow }) => {
  return (
    <FixedSizeList
      height={height} // The height of the viewport
      itemCount={items.length} // Total number of items
      itemSize={itemSize} // Height of each item
      width="100%" // Full width
    >
      {({ index, style }) => (
        <div style={style}>
          {renderRow(items[index], index)} {/* Render each row dynamically */}
        </div>
      )}
    </FixedSizeList>
  );
};

VirtualizedList.propTypes = {
  items: PropTypes.array.isRequired, // Array of data to be displayed
  height: PropTypes.number.isRequired, // Viewport height
  itemSize: PropTypes.number.isRequired, // Height of each row
  renderRow: PropTypes.func.isRequired, // Function to render each row
};

export default VirtualizedList;
