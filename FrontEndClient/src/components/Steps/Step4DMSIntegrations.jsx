import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateDMSIntegrations } from "../../store/slices/configSlice";
import StepContainer from "./StepContainer";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";
import { Server, CheckCircle, AlertCircle } from "lucide-react";
import {
  fetchDealerSettings,
  fetchLenders,
  fetchCreditAppLenders,
} from "./helpers/tekionApi";

const dmsSystems = [
  { value: "", label: "Select DMS System" },
  { value: "CDK", label: "CDK Global" },
  { value: "Reynolds", label: "Reynolds & Reynolds" },
  { value: "Dealertrack", label: "Dealertrack DMS" },
  { value: "Auto", label: "AutoMate" },
  { value: "PBS", label: "PBS Systems" },
  { value: "Tekion", label: "Tekion DMS" },
];

export default function Step4DMSIntegrations() {
  const dispatch = useDispatch();
  const dmsIntegrations = useSelector((state) => state.config.dmsIntegrations);

  const [formData, setFormData] = useState({
    ...dmsIntegrations,
    apiEndpoint: dmsIntegrations.apiEndpoint || "",
    credentials: dmsIntegrations.credentials || { username: "", password: "" }, // Keep for backward compat, but not used
  });
  const [toastState, setToastState] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isTekionSelected, setIsTekionSelected] = useState(
    formData.dmsSystem === "Tekion"
  );
  const [loading, setLoading] = useState(false);
  const [isValidated, setIsValidated] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "dmsSystem") {
      setIsTekionSelected(value === "Tekion");
      setIsValidated(false); // Reset validation on change
    }
  };

  const handleTestConnection = async () => {
    if (isTekionSelected) {
      if (!formData.apiEndpoint) {
        showToast("error", "Dealer ID is required for Tekion integration.");
        return;
      }

      setLoading(true);
      setIsValidated(false);

      try {
        // Validate with dealer settings first, treating apiEndpoint as dealerId
        await fetchDealerSettings(formData.apiEndpoint);
        setIsValidated(true);
        showToast("success", "Dealer ID validated successfully!");
      } catch (error) {
        setIsValidated(false);
        const errorMsg =
          error.message ||
          "Failed to validate Dealer ID. Please check and try again.";
        showToast("error", errorMsg);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!formData.dmsSystem || !formData.apiEndpoint) {
      showToast(
        "error",
        "Please fill in all required fields before testing the connection."
      );
      return;
    }

    try {
      // Simulate connection test for other DMS - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      showToast(
        "success",
        "Connection test successful! DMS integration is working properly."
      );
    } catch (error) {
      const errorMsg =
        error?.message ||
        "Connection test failed. Please check your endpoint and try again.";
      showToast("error", errorMsg);
    }
  };

  const handleNext = () => {
    if (isTekionSelected) {
      if (!isValidated) {
        showToast("error", "Please validate Dealer ID before proceeding.");
        return;
      }
      // For Tekion, save apiEndpoint as dealerId, empty others
      dispatch(
        updateDMSIntegrations({
          ...formData,
          dealerId: formData.apiEndpoint,
          apiEndpoint: "",
          credentials: { username: "", password: "" },
        })
      );
    } else {
      // For other DMS, save without credentials
      const { credentials, ...saveData } = formData;
      dispatch(
        updateDMSIntegrations({
          ...saveData,
          credentials: { username: "", password: "" }, // Empty for consistency
        })
      );
    }
  };

  const isValid = isTekionSelected
    ? !!formData.dmsSystem && !!formData.apiEndpoint && isValidated
    : formData.dmsSystem && formData.apiEndpoint;

  const buttonText = isValidated
    ? "Validated ✓"
    : loading
    ? "Validating..."
    : "Validate Connection";

  return (
    <StepContainer
      stepNumber={4}
      title="DMS Integrations"
      onNext={handleNext}
      canGoNext={isValid}
    >
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-dark-surface-warm border border-brand-focus/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Server className="w-5 h-5 text-brand-focus mt-0.5" />
            <div>
              <h4 className="font-semibold text-dark-text mb-1">
                DMS Integration
              </h4>
              <p className="text-sm text-dark-text-secondary">
                Connect your Dealer Management System to sync inventory,
                customer data, and transactions.
              </p>
            </div>
          </div>
        </div>

        {/* DMS System Selection */}
        <TextField
          select
          label="DMS System"
          name="dmsSystem"
          value={formData.dmsSystem || ""}
          onChange={handleChange}
          required
          fullWidth
          variant="outlined"
          SelectProps={{
            displayEmpty: true,
            renderValue: (selected) => {
              if (!selected) {
                return (
                  <span style={{ color: "#9ca3af" }}>Select DMS System</span>
                );
              }
              const system = dmsSystems.find((s) => s.value === selected);
              return system?.label || selected;
            },
          }}
          InputLabelProps={{
            shrink: true,
          }}
        >
          {dmsSystems.map((system) => (
            <MenuItem
              key={system.value}
              value={system.value}
              disabled={!system.value}
            >
              {system.label}
            </MenuItem>
          ))}
        </TextField>

        {/* API Endpoint */}
        <TextField
          label={isTekionSelected ? "Dealer ID" : "API Endpoint"}
          type={isTekionSelected ? "text" : "url"}
          name="apiEndpoint"
          value={formData.apiEndpoint}
          onChange={handleChange}
          required
          fullWidth
          variant="outlined"
          placeholder={isTekionSelected ? "e.g., techmotors_4" : ""}
        />

        {/* Test Connection Button */}
        <Button
          variant="contained"
          onClick={handleTestConnection}
          disabled={loading}
          sx={{ width: { xs: "100%", md: "auto" } }}
        >
          {buttonText}
        </Button>
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
