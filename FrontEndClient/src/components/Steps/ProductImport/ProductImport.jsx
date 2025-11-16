import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import {
  setSelectedProducts,
  toggleProduct,
  setImportedProducts,
} from "../../../store/slices/productsSlice";
import {
  importProducts as importProductsApi,
  transformImportedProducts,
} from "../helpers/productsApi";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Download, CheckCircle, AlertCircle } from "lucide-react";

const ProductImport = ({ onImportSuccess }) => {
  const dispatch = useDispatch();
  const productsState = useSelector((state) => state.products);
  const [importedProducts, setLocalImportedProducts] = useState([]);
  const [showImportedProducts, setShowImportedProducts] = useState(false);

  const importMutation = useMutation({
    mutationFn: ({ dealerId, vendorIds }) =>
      importProductsApi(dealerId, vendorIds),
    onSuccess: (data) => {
      const transformedProducts = transformImportedProducts(
        data.commonProducts
      );
      setLocalImportedProducts(transformedProducts); // Local update for rendering
      setShowImportedProducts(true);

      // Now the Redux action is accessible (no shadowing)
      console.log(
        "Dispatching setImportedProducts with payload length:",
        transformedProducts?.length || 0
      );

      // Safety check: Ensure payload is plain array before dispatching
      if (
        Array.isArray(transformedProducts) &&
        transformedProducts.every(
          (p) =>
            typeof p === "object" &&
            p !== null &&
            typeof p.id === "string" &&
            typeof p.name === "string"
        )
      ) {
        dispatch(setImportedProducts(transformedProducts)); // Redux global state
        console.log("✅ Redux dispatch successful");
      } else {
        console.warn(
          "⚠️ Skipping Redux dispatch: Invalid payload",
          transformedProducts
        );
      }

      // Automatically select all imported products
      const productIds = transformedProducts.map((product) => product.id);
      dispatch(setSelectedProducts(productIds));

      if (onImportSuccess) {
        onImportSuccess(transformedProducts);
      }
    },
    onError: (error) => {
      console.error("Failed to import products:", error);
    },
  });

  const handleImportProducts = () => {
    if (!productsState.dealerId || productsState.selectedVendors.length === 0) {
      return;
    }

    const vendorIds = productsState.selectedVendors.map((v) => v.id);
    const vendors = productsState.selectedVendors; // Full objects

    importMutation.mutate({
      dealerId: productsState.dealerId,
      vendorIds,
      vendors, // Send full vendor objects for backend to use
    });
  };

  const handleProductToggle = (productId) => {
    dispatch(toggleProduct(productId));
  };

  const isValid =
    productsState.dealerId && productsState.selectedVendors.length > 0;

  return (
    <div className="border-t border-dark-border pt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-dark-text">
          Choose Products to Import
        </h3>
        <Button
          onClick={handleImportProducts}
          disabled={!isValid || importMutation.isPending}
          variant="contained"
          startIcon={
            importMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Download className="w-4 h-4" />
            )
          }
        >
          {importMutation.isPending ? "Importing..." : "Import Products"}
        </Button>
      </div>

      {/* Import Status */}
      {importMutation.isError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Import Failed</span>
          </div>
          <p className="text-red-600 mt-1">
            {importMutation.error?.message ||
              "An error occurred while importing products."}
          </p>
        </div>
      )}

      {importMutation.isSuccess && showImportedProducts && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Import Successful</span>
          </div>
          <p className="text-green-600 mt-1">
            Found {importedProducts.length} products available for
            configuration.
          </p>
        </div>
      )}

      {/* Imported Products List */}
      {showImportedProducts && importedProducts.length > 0 && (
        <div className="space-y-2">
          {importedProducts.map((product) => (
            <div
              key={product.id}
              className="p-4 bg-dark-bg rounded-lg hover:bg-dark-surface-light transition-all cursor-pointer"
              onClick={() => handleProductToggle(product.id)}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={productsState.selectedProducts.includes(
                      product.id
                    )}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleProductToggle(product.id);
                    }}
                  />
                }
                label={
                  <div>
                    <span className="text-dark-text font-medium">
                      {product.name}
                    </span>
                    <span className="text-dark-text-secondary text-sm ml-2">
                      ({product.category})
                    </span>
                  </div>
                }
              />
            </div>
          ))}
        </div>
      )}

      {/* No Products Found */}
      {showImportedProducts && importedProducts.length === 0 && (
        <div className="text-center py-8 text-dark-text-secondary">
          <p>No products found for the selected vendors.</p>
          <p className="text-sm mt-2">
            Try selecting different vendors or contact support if this issue
            persists.
          </p>
        </div>
      )}

      {/* Instructions */}
      {!showImportedProducts && (
        <div className="text-center py-8 text-dark-text-secondary">
          <p>Import products that are available from your selected vendors.</p>
          <p className="text-sm mt-2">
            Only products that are both offered by vendors and available to your
            dealer will be shown.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductImport;
