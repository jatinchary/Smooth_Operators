import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import {
  setProductIntegration,
  setDealerId,
} from "../../store/slices/productsSlice";
import StepContainer from "./StepContainer";
import TextField from "@mui/material/TextField";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";
import { Package, FileText } from "lucide-react";
import VendorManagement from "./ProductImport/VendorManagement";
import ProductImport from "./ProductImport/ProductImport";
import ProductConfiguration from "./ProductImport/ProductConfiguration";
import { logProductsSummary } from "./helpers/productsApi";

export default function Step3Products() {
  const dispatch = useDispatch();
  const productsState = useSelector((state) => state.products);
  const generalInfo = useSelector((state) => state.config.generalInfo);
  const [toastState, setToastState] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showToast = (severity, message) => {
    setToastState({
      open: true,
      severity,
      message,
    });
  };

  const handleToastClose = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setToastState((prev) => ({ ...prev, open: false }));
  };

  const ToastTransition = (props) => <Slide {...props} direction="left" />;

  const handleIntegrationChange = (value) => {
    dispatch(setProductIntegration(value));
  };

  const handleDealerIdChange = (e) => {
    dispatch(setDealerId(e.target.value));
  };

  const logMutation = useMutation({
    mutationFn: (payload) => logProductsSummary(payload),
    onSuccess: () => {
      showToast('success', 'Products have been saved');
    },
    onError: (error) => {
      const errorMsg = error?.message || 'Failed to save products. Please try again.';
      showToast('error', errorMsg);
    },
  });

  const handleLogProducts = () => {
    // Validate that dealershipId is available
    if (!generalInfo.selectedDealershipId) {
      showToast(
        "error",
        "Please save a dealership in Step 1 before saving products."
      );
      return;
    }

    const vendorSummaries = productsState.selectedVendors.map((vendor) => ({
      id: vendor.id,
      name: vendor.name,
    }));

    const selectedProductDetails = productsState.importedProducts
      .filter((product) => productsState.selectedProducts.includes(product.id))
      .map((product) => ({
        EX1ProductID: product.id,
        ProductName: product.name,
        ProductCode: product.category,
        vendors: Array.isArray(product.vendors)
          ? product.vendors.map((vendor) => ({
              id: String(vendor.id ?? ""),
              name: vendor.name ?? "",
            }))
          : [],
      }));

    const configurationDetails = selectedProductDetails.map((product) => {
      const config =
        productsState.productConfigurations.find(
          (item) => item.productId === product.EX1ProductID
        ) || {};

      return {
        productId: product.EX1ProductID,
        productName: product.ProductName,
        dealTypes: Array.isArray(config.dealTypes) ? config.dealTypes : [],
        vehicleTypes: Array.isArray(config.vehicleTypes)
          ? config.vehicleTypes
          : [],
      };
    });

    const summary = [
      { "product integration": productsState.productIntegration },
      { dealerId: productsState.dealerId },
      { vendors: vendorSummaries },
      { products: selectedProductDetails },
      {
        "product deal types and vehicle types": configurationDetails.map(
          ({ productId, productName, dealTypes, vehicleTypes }) => ({
            productId,
            productName,
            dealTypes,
            vehicleTypes,
          })
        ),
      },
    ];

    // Convert dealershipId to number if it exists
    const dealershipId = generalInfo.selectedDealershipId 
      ? Number(generalInfo.selectedDealershipId) 
      : null;

    logMutation.mutate({
      summary,
      context: {
        productIntegration: productsState.productIntegration,
        dealerId: productsState.dealerId,
        dealershipId: dealershipId,
        vendors: vendorSummaries,
        products: selectedProductDetails,
        productConfigurations: configurationDetails,
        selectedProductIds: productsState.selectedProducts,
        importedProductCount: productsState.importedProducts.length,
      },
    });
  };

  const isValid = productsState.dealerId;

  return (
    <StepContainer stepNumber={3} title="Products" canGoNext={isValid}>
      <div className="space-y-8">
        {/* Product Integration Selection */}
        <div>
          <label className="flex text-dark-text font-medium mb-3 items-center gap-2">
            <Package
              className="w-5 h-5"
              style={{ color: "var(--theme-primary, #E7E9BB)" }}
            />
            Choose your product integration
          </label>
          <RadioGroup
            value={productsState.productIntegration}
            onChange={(e) => handleIntegrationChange(e.target.value)}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <div
                  className={`
                  p-6 rounded-lg border transition-all duration-200
                  ${
                    productsState.productIntegration === "F&I"
                      ? "border-brand-focus bg-gradient-card"
                      : "border-dark-border hover:border-brand-focus"
                  }
                `}
                >
                  <FormControlLabel
                    value="F&I"
                    control={<Radio />}
                    label={<span className="text-lg font-semibold">F&I</span>}
                  />
                </div>
              </Grid>

              <Grid item xs={12} md={6}>
                <div
                  className={`
                  p-6 rounded-lg border transition-all duration-200
                  ${
                    productsState.productIntegration === "PEN"
                      ? "border-brand-focus bg-gradient-card"
                      : "border-dark-border hover:border-brand-focus"
                  }
                `}
                >
                  <FormControlLabel
                    value="PEN"
                    control={<Radio />}
                    label={<span className="text-lg font-semibold">PEN</span>}
                  />
                </div>
              </Grid>
            </Grid>
          </RadioGroup>
        </div>

        {/* Dealer ID */}
        <TextField
          label="Dealer ID"
          value={productsState.dealerId}
          onChange={handleDealerIdChange}
          required
          fullWidth
          variant="outlined"
        />

        {/* Vendor Management */}
        <VendorManagement />

        {/* Product Import */}
        <ProductImport />

        {/* Product Configuration */}
        <ProductConfiguration />

        <div className="border-t border-dark-border pt-6 space-y-4">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="flex-end"
            spacing={2}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handleLogProducts}
              disabled={logMutation.isPending || !productsState.dealerId}
              startIcon={
                logMutation.isPending ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <FileText size={18} />
                )
              }
            >
              {logMutation.isPending ? "Saving..." : "Save Products"}
            </Button>
          </Stack>
        </div>
      </div>
      <Snackbar
        open={toastState.open}
        autoHideDuration={4000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={ToastTransition}
      >
        <Alert
          onClose={handleToastClose}
          severity={toastState.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toastState.message}
        </Alert>
      </Snackbar>
    </StepContainer>
  );
}
