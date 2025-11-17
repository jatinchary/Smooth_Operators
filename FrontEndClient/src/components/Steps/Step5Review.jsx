import { useState } from "react";
import { useSelector } from "react-redux";
import StepContainer from "./StepContainer";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";
import { CheckCircle, Building, CreditCard, Server } from "lucide-react";

export default function Step5Review() {
  const config = useSelector((state) => state.config);
  const products = useSelector((state) => state.products);
  const [toastState, setToastState] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (severity, message) => {
    setToastState({
      open: true,
      severity,
      message,
    });
  };

  const handleToastClose = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setToastState((prev) => ({ ...prev, open: false }));
  };

  const ToastTransition = (props) => <Slide {...props} direction="left" />;

  const handleSubmit = async () => {
    try {
      console.log("Submitting configuration:", config);
      // Simulate API call - replace with actual submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showToast("success", "Configuration submitted successfully!");
    } catch (error) {
      const errorMsg =
        error?.message || "Failed to submit configuration. Please try again.";
      showToast("error", errorMsg);
    }
  };

  return (
    <StepContainer
      stepNumber={5}
      title="Review & Submit"
      onNext={handleSubmit}
      canGoNext={true}
    >
      <div className="space-y-6">
        {/* Success Message */}
        <div className="bg-gradient-card border border-green-500/30 rounded-lg p-6 flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-dark-text mb-2">
              Configuration Complete!
            </h3>
            <p className="text-dark-text-secondary">
              Please review your settings below before submitting.
            </p>
          </div>
        </div>

        {/* Dealership Information Review */}
        <div className="bg-dark-bg rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Building className="w-6 h-6 text-brand-focus" />
            <h3 className="text-xl font-semibold text-dark-text">
              Dealership Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Legal Name" value={config.generalInfo.legalName} />
            <InfoItem label="DBA Name" value={config.generalInfo.dbaName} />
            <InfoItem label="Website" value={config.generalInfo.website} />
            <InfoItem label="Phone" value={config.generalInfo.phone} />
            <InfoItem label="FAX" value={config.generalInfo.fax} />
            <InfoItem label="Email" value={config.generalInfo.email} />
            <InfoItem label="Address 1" value={config.generalInfo.address1} />
            <InfoItem label="Address 2" value={config.generalInfo.address2} />
            <InfoItem label="City" value={config.generalInfo.city} />
            <InfoItem label="State" value={config.generalInfo.state} />
            <InfoItem label="ZIP Code" value={config.generalInfo.zipCode} />
            <InfoItem label="Country" value={config.generalInfo.country} />
          </div>
        </div>

        {/* Finance Providers Review */}
        <div className="bg-dark-bg rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-6 h-6 text-brand-focus" />
            <h3 className="text-xl font-semibold text-dark-text">
              Finance Providers
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem
              label="Primary Provider"
              value={config.financeProviders.primaryProvider}
            />
            <InfoItem
              label="Via Lending Platform"
              value={config.financeProviders.viaLP ? "Yes" : "No"}
            />
          </div>

          {(config.financeProviders.primaryProvider === "RouteOne" ||
            config.financeProviders.primaryProvider === "Both") && (
            <div className="mt-4 pl-4 border-l-2 border-brand-focus">
              <h4 className="font-semibold text-dark-text mb-3 flex items-center gap-2">
                RouteOne
                {config.financeProviders.routeOneConfig.isConfigured && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                    Configured
                  </span>
                )}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  label="Dealer ID"
                  value={config.financeProviders.routeOneConfig.dealerId}
                />
              </div>
            </div>
          )}

          {(config.financeProviders.primaryProvider === "DealerTrack" ||
            config.financeProviders.primaryProvider === "Both") && (
            <div className="mt-4 pl-4 border-l-2 border-brand-secondary">
              <h4 className="font-semibold text-dark-text mb-3 flex items-center gap-2">
                DealerTrack
                {config.financeProviders.dealerTrackConfig.isConfigured && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                    Configured
                  </span>
                )}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  label="Dealer ID"
                  value={config.financeProviders.dealerTrackConfig.dealerId}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <InfoItem
              label="DMS Lenders"
              value={`${
                config.financeProviders.dmsLenders?.length || 0
              } lender(s)`}
            />
            <InfoItem
              label="Credit App Lenders"
              value={`${
                config.financeProviders.creditAppLenders?.length || 0
              } lender(s)`}
            />
          </div>
        </div>

        {/* Products Review */}
        <div className="bg-dark-bg rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-6 h-6 text-brand-focus" />
            <h3 className="text-xl font-semibold text-dark-text">Products</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem
              label="Product Integration"
              value={products.productIntegration}
            />
            <InfoItem label="Dealer ID" value={products.dealerId} />
            <InfoItem
              label="Selected Vendors"
              value={`${products.selectedVendors.length} vendor(s)`}
            />
            <InfoItem
              label="Selected Products"
              value={`${products.selectedProducts.length} product(s)`}
            />
          </div>
        </div>

        {/* DMS Integration Review */}
        <div className="bg-dark-bg rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Server className="w-6 h-6 text-brand-focus" />
            <h3 className="text-xl font-semibold text-dark-text">
              DMS Integration
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem
              label="DMS System"
              value={config.dmsIntegrations.dmsSystem}
            />
            <InfoItem
              label="API Endpoint"
              value={config.dmsIntegrations.apiEndpoint}
            />
            <InfoItem
              label="Username"
              value={config.dmsIntegrations.credentials.username}
            />
          </div>
        </div>
      </div>
      <Snackbar
        open={toastState.open}
        autoHideDuration={4000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={ToastTransition}
      >
        <Alert
          onClose={handleToastClose}
          severity={toastState.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toastState.message}
        </Alert>
      </Snackbar>
    </StepContainer>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <dt className="text-sm text-dark-text-secondary mb-1">{label}</dt>
      <dd className="text-dark-text font-medium">{value || "-"}</dd>
    </div>
  );
}
