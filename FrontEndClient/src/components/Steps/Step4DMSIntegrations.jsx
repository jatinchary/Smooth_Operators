import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateDMSIntegrations } from "../../store/slices/configSlice";
import StepContainer from "./StepContainer";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";
import CircularProgress from "@mui/material/CircularProgress";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Server } from "lucide-react";
import { fetchDealerSettings } from "./helpers/tekionApi";

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
    dealerId: dmsIntegrations.dealerId || "",
  });
  const [toastState, setToastState] = useState({
    open: false,
    message: "",
    severity: "success",
  });
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
  };

  const handleTestConnection = async () => {
    if (!formData.dealerId) {
      showToast("error", "Dealer ID is required.");
      return;
    }

    setLoading(true);

    try {
      // Validate with dealer settings
      await fetchDealerSettings(formData.dealerId);
      showToast("success", "Dealer ID validated successfully!");
      setIsValidated(true);
    } catch (error) {
      const errorMsg =
        error.message ||
        "Failed to validate Dealer ID. Please check and try again.";
      showToast("error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    // Save with dealerId, empty others
    dispatch(
      updateDMSIntegrations({
        ...formData,
      })
    );
  };

  const isValid = !!formData.dmsSystem && !!formData.dealerId;

  const buttonText = isValidated
    ? "Validated ✓"
    : loading
    ? "Validating..."
    : "Validate Dealer ID";

  return (
    <StepContainer
      stepNumber={4}
      title="DMS Integrations"
      onNext={handleNext}
      canGoNext={isValid}
    >
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-gradient-card border border-brand-focus/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Server className="w-5 h-5 text-brand-focus mt-0.5" />
            <div>
              <h4 className="font-semibold text-brand-focus mb-1" style={{ background: 'none', WebkitTextFillColor: 'unset', color: 'var(--theme-primary, #E7E9BB)' }}>
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

        {/* Dealer ID */}
        <TextField
          label="Dealer ID"
          name="dealerId"
          value={formData.dealerId}
          onChange={handleChange}
          required
          fullWidth
          variant="outlined"
          placeholder=""
        />

        {/* Test Connection Button */}
        <Button
          variant="contained"
          onClick={handleTestConnection}
          disabled={loading || !formData.dealerId || isValidated}
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
