// import React from "react";
// import PropTypes from "prop-types";

// const Pagination = ({ currentPage, totalPages, onPageChange }) => {
//   return (
//     <nav aria-label="Page navigation">
//       <ul className="pagination justify-content-center">
//         <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
//           <button
//             className="page-link"
//             style={{ backgroundColor: "#14A4D6", color: "#fff" }} // Primary color
//             onClick={() => onPageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//           >
//             Previous
//           </button>
//         </li>
//         {[...Array(totalPages)].map((_, index) => (
//           <li
//             key={index + 1}
//             className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
//           >
//             <button
//               className={`page-link ${
//                 currentPage === index + 1 ? "text-white" : ""
//               }`}
//               style={{ 
//                 backgroundColor: currentPage === index + 1 ? "#FFAF04" : "#14A4D6", 
//                 color: currentPage === index + 1 ? "#fff" : "#fff" 
//               }} 
//               onClick={() => onPageChange(index + 1)}
//             >
//               {index + 1}
//             </button>
//           </li>
//         ))}
//         <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
//           <button
//             className="page-link"
//             style={{ backgroundColor: "#14A4D6", color: "#fff" }} // Primary color
//             onClick={() => onPageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//           >
//             Next
//           </button>
//         </li>
//       </ul>
//     </nav>
//   );
// };

// Pagination.propTypes = {
//   currentPage: PropTypes.number.isRequired,
//   totalPages: PropTypes.number.isRequired,
//   onPageChange: PropTypes.func.isRequired,
// };

// export default Pagination;
import React from "react";
import PropTypes from "prop-types";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPages = () => {
    let pages = [];

    if (totalPages <= 5) {
      // If total pages are small, show all
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      pages.push(1); // First page

      if (currentPage > 3) pages.push("..."); // Left ellipsis

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("..."); // Right ellipsis

      pages.push(totalPages); // Last page
    }

    return pages;
  };

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center">
        {/* Previous Button */}
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            style={{ backgroundColor: "#14A4D6", color: "#fff" }}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
        </li>

        {/* Page Numbers */}
        {getPages().map((page, index) => (
          <li
            key={index}
            className={`page-item ${currentPage === page ? "active" : ""}`}
          >
            {page === "..." ? (
              <span className="page-link" style={{background:"#14A4D6",color: "#fff"}}>...</span>
            ) : (
              <button
                className={`page-link ${
                  currentPage === page ? "text-white" : ""
                }`}
                style={{
                  backgroundColor: currentPage === page ? "#FFAF04" : "#14A4D6",
                  color: "#fff",
                }}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            )}
          </li>
        ))}

        {/* Next Button */}
        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button
            className="page-link"
            style={{ backgroundColor: "#14A4D6", color: "#fff" }}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
