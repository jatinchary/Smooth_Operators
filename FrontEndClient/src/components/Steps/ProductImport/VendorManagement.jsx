import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { toggleVendor } from "../../../store/slices/productsSlice";
import { fetchVendors } from "../helpers/productsApi";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { Download } from "lucide-react";

const VendorManagement = () => {
  const dispatch = useDispatch();
  const productsState = useSelector((state) => state.products);

  const [showVendors, setShowVendors] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("");
  const itemsPerPage = 10; // Show 10 vendors per page

  // Fetch vendors
  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ["vendors", productsState.dealerId],
    queryFn: () => fetchVendors(productsState.dealerId),
    enabled: Boolean(showVendors && productsState.dealerId),
  });

  // Pagination logic for vendors
  const totalVendors = vendors?.length || 0;
  const totalPages = Math.ceil(totalVendors / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVendors = vendors?.slice(startIndex, endIndex);

  const handleImportVendors = () => {
    setShowVendors(true);
    setCurrentPage(1); // Reset to first page when importing vendors
    setPageInput(""); // Clear page input
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setPageInput(""); // Clear input when using buttons
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setPageInput(""); // Clear input
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setPageInput(""); // Clear input
    }
  };

  // Page input handlers
  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const pageNum = Number.parseInt(pageInput, 10);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setPageInput("");
    } else {
      // Reset input if invalid
      setPageInput("");
    }
  };

  const isValid = productsState.dealerId;

  return (
    <div className="border-t border-dark-border pt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-dark-text">Choose Vendors</h3>
        <Button
          onClick={handleImportVendors}
          disabled={!isValid}
          variant="contained"
          startIcon={<Download className="w-4 h-4" />}
        >
          Import Vendors
        </Button>
      </div>

      {showVendors && (
        <div className="space-y-4">
          {vendorsLoading ? (
            <div className="text-dark-text-secondary py-4">
              Loading vendors...
            </div>
          ) : (
            <>
              {/* Vendor count display */}
              <div className="text-sm text-dark-text-secondary">
                Showing {startIndex + 1}-{Math.min(endIndex, totalVendors)} of{" "}
                {totalVendors} vendors
                {productsState.selectedVendors.length > 0 && (
                  <span className="ml-2 font-medium">
                    ({productsState.selectedVendors.length} selected)
                  </span>
                )}
              </div>

              {/* Paginated vendors list */}
              <div className="space-y-2">
                {paginatedVendors?.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="p-4 bg-dark-bg rounded-lg hover:bg-dark-surface-light transition-all cursor-pointer"
                    onClick={() => dispatch(toggleVendor(vendor.id))}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={productsState.selectedVendors.includes(
                            vendor.id
                          )}
                          onClick={(e) => dispatch(toggleVendor(vendor.id))}
                        />
                      }
                      onClick={() => dispatch(toggleVendor(vendor.id))}
                      label={vendor.name}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-dark-border">
                  <Button
                    variant="outlined"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    size="small"
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-4">
                    {/* Page numbers */}
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          // Show first page, last page, current page, and pages around current
                          return (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          );
                        })
                        .map((page, index, array) => (
                          <div key={page} className="flex items-center">
                            {/* Add ellipsis if there's a gap */}
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="text-dark-text-secondary mx-2">
                                ...
                              </span>
                            )}
                            <Button
                              variant={
                                currentPage === page ? "contained" : "outlined"
                              }
                              onClick={() => handlePageChange(page)}
                              size="small"
                              className="min-w-0 w-10"
                            >
                              {page}
                            </Button>
                          </div>
                        ))}
                    </div>

                    {/* Page input */}
                    <form
                      onSubmit={handlePageInputSubmit}
                      className="flex items-center gap-2"
                    >
                      <span className="text-sm text-dark-text-secondary">
                        Go to:
                      </span>
                      <TextField
                        size="small"
                        value={pageInput}
                        onChange={handlePageInputChange}
                        onBlur={handlePageInputSubmit}
                        placeholder={`${currentPage}`}
                        inputProps={{
                          min: 1,
                          max: totalPages,
                          style: { textAlign: "center", width: "50px" },
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <span className="text-xs text-dark-text-secondary">
                                / {totalPages}
                              </span>
                            </InputAdornment>
                          ),
                        }}
                        variant="outlined"
                        className="w-20"
                      />
                    </form>
                  </div>

                  <Button
                    variant="outlined"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    size="small"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorManagement;
