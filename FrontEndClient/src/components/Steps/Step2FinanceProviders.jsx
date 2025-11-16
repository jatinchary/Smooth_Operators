import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { updateFinanceProviders } from "../../store/slices/configSlice";
import StepContainer from "./StepContainer";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import { Settings, Download } from "lucide-react";

const providers = ["RouteOne", "DealerTrack", "Both"];

// Mock API functions - replace with actual API calls
const fetchDMSLenders = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    { id: "lender1", name: "Chase Auto Finance", dmsId: "DMS001" },
    { id: "lender2", name: "Wells Fargo Dealer Services", dmsId: "DMS002" },
    { id: "lender3", name: "Ally Financial", dmsId: "DMS003" },
    { id: "lender4", name: "Capital One Auto Finance", dmsId: "DMS004" },
    { id: "lender5", name: "Bank of America", dmsId: "DMS005" },
  ];
};

export default function Step2FinanceProviders() {
  const dispatch = useDispatch();
  const financeProviders = useSelector(
    (state) => state.config.financeProviders
  );
  const generalInfo = useSelector((state) => state.config.generalInfo);

  const [formData, setFormData] = useState({
    ...financeProviders,
    viaLP: true,
    routeOneConfig: {},
    dealerTrackConfig: {},
  });
  const [showDMSLenders, setShowDMSLenders] = useState(false);

  // Fetch DMS Lenders
  const { data: dmsLenders, isLoading: dmsLendersLoading } = useQuery({
    queryKey: ["dmsLenders"],
    queryFn: fetchDMSLenders,
    enabled: showDMSLenders,
  });

  const handleProviderChange = (provider) => {
    setFormData((prev) => ({ ...prev, primaryProvider: provider }));
  };

  const handleRouteOneChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      routeOneConfig: { ...(prev.routeOneConfig || {}), [name]: value },
    }));
  };

  const handleDealerTrackChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      dealerTrackConfig: { ...(prev.dealerTrackConfig || {}), [name]: value },
    }));
  };

  const handleRouteOneSetup = async () => {
    const dealershipId = generalInfo?.selectedDealershipId;
    if (!dealershipId) {
      alert(
        "Dealership ID not selected in General Info. Please go back and select a dealership."
      );
      return;
    }

    try {
      const response = await fetch("/api/setup-finance-provider", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dealerId: formData.routeOneConfig.dealerId,
          provider: "route-one",
          generalInfo: generalInfo,
          dealershipId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Setup failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("RouteOne setup response:", data);

      setFormData((prev) => ({
        ...prev,
        routeOneConfig: { ...(prev.routeOneConfig || {}), isConfigured: true },
      }));
    } catch (error) {
      console.error("RouteOne setup error:", error);
      alert("Failed to setup RouteOne configuration. Please try again.");
    }
  };

  const handleDealerTrackSetup = async () => {
    const dealershipId = generalInfo?.selectedDealershipId;
    if (!dealershipId) {
      alert(
        "Dealership ID not selected in General Info. Please go back and select a dealership."
      );
      return;
    }

    try {
      const response = await fetch("/api/setup-finance-provider", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dealerId: formData.dealerTrackConfig.dealerId,
          provider: "dealertrack",
          generalInfo: generalInfo,
          dealershipId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Setup failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("DealerTrack setup response:", data);

      setFormData((prev) => ({
        ...prev,
        dealerTrackConfig: {
          ...(prev.dealerTrackConfig || {}),
          isConfigured: true,
        },
      }));
    } catch (error) {
      console.error("DealerTrack setup error:", error);
      alert("Failed to setup DealerTrack configuration. Please try again.");
    }
  };

  const handleImportDMSLenders = () => {
    setShowDMSLenders(true);
  };

  const handleImportCreditAppLenders = async () => {
    const dealershipId = generalInfo?.selectedDealershipId;
    if (!dealershipId) {
      alert(
        "Dealership ID not selected in General Info. Please go back and select a dealership."
      );
      return;
    }

    let provider, interfaceOrgId;
    if (formData.primaryProvider === "RouteOne") {
      provider = "route-one";
      interfaceOrgId = formData.routeOneConfig.dealerId;
    } else if (formData.primaryProvider === "DealerTrack") {
      provider = "dealertrack";
      interfaceOrgId = formData.dealerTrackConfig.dealerId;
    } else if (formData.primaryProvider === "Both") {
      provider = "route-one"; // Default to RouteOne for Both
      interfaceOrgId = formData.routeOneConfig.dealerId;
    } else {
      alert("No provider selected");
      return;
    }

    if (!interfaceOrgId) {
      alert("Provider dealer ID not configured");
      return;
    }

    try {
      const response = await fetch("/api/import-credit-app-lenders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dealershipId,
          provider,
          interfaceOrgId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`);
      }

      await response.json(); // Just to consume response
      alert("Credit app lenders imported successfully!");
    } catch (error) {
      console.error("Import credit app lenders error:", error);
      alert("Failed to import credit app lenders. Please try again.");
    }
  };

  const handleDMSLenderToggle = (lenderId) => {
    setFormData((prev) => {
      const currentLenders = prev.dmsLenders || [];
      const exists = currentLenders.find((l) => l.id === lenderId);

      if (exists) {
        return {
          ...prev,
          dmsLenders: currentLenders.filter((l) => l.id !== lenderId),
        };
      } else {
        const lender = dmsLenders.find((l) => l.id === lenderId);
        return {
          ...prev,
          dmsLenders: [...currentLenders, lender],
        };
      }
    });
  };

  const handleNext = () => {
    dispatch(updateFinanceProviders(formData));
  };

  const showRouteOne =
    formData.primaryProvider === "RouteOne" ||
    formData.primaryProvider === "Both";
  const showDealerTrack =
    formData.primaryProvider === "DealerTrack" ||
    formData.primaryProvider === "Both";

  const isRouteOneValid = formData.routeOneConfig.dealerId;
  const isDealerTrackValid =
    formData.dealerTrackConfig.dealerId && formData.dealerTrackConfig.apiKey;

  const isValid =
    formData.primaryProvider &&
    ((showRouteOne && isRouteOneValid) ||
      (showDealerTrack && isDealerTrackValid));

  const isConfigurationComplete =
    formData.primaryProvider &&
    (formData.primaryProvider === "RouteOne"
      ? !!formData.routeOneConfig?.isConfigured
      : formData.primaryProvider === "DealerTrack"
      ? !!formData.dealerTrackConfig?.isConfigured
      : formData.primaryProvider === "Both"
      ? !!formData.routeOneConfig?.isConfigured &&
        !!formData.dealerTrackConfig?.isConfigured
      : false);

  return (
    <StepContainer
      stepNumber={2}
      title="Finance & Providers"
      onNext={handleNext}
      canGoNext={isValid}
    >
      <div className="space-y-8">
        {/* Primary Finance Provider */}
        <TextField
          select
          label="Primary Finance Provider"
          name="primaryProvider"
          value={formData.primaryProvider || ""}
          onChange={(e) => handleProviderChange(e.target.value)}
          fullWidth
          variant="outlined"
          SelectProps={{
            displayEmpty: true,
          }}
          InputLabelProps={{
            shrink: true,
          }}
        >
          {providers.map((provider) => (
            <MenuItem key={provider} value={provider}>
              {provider}
            </MenuItem>
          ))}
        </TextField>
        <FormControlLabel
          control={
            <Switch
              checked={true}
              disabled={true}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#E7E9BB",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#E7E9BB",
                },
              }}
            />
          }
          label="Via Lending Platform"
          sx={{
            padding: "16px",
            backgroundColor: "#1a1d25",
            borderRadius: "8px",
            border: "1px solid #3d4354",
            width: "100%",
            margin: 0,
            justifyContent: "space-between",
            marginLeft: 0,
          }}
        />

        {/* RouteOne Configuration */}
        {showRouteOne && (
          <div className="border-l-4 border-brand-focus pl-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dark-text flex items-center gap-2">
                RouteOne Configuration
              </h3>
              {formData.routeOneConfig.isConfigured && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                  Configured
                </span>
              )}
            </div>

            <TextField
              label="Dealer ID"
              name="dealerId"
              value={formData.routeOneConfig.dealerId}
              onChange={handleRouteOneChange}
              fullWidth
              variant="outlined"
            />

            <Button
              onClick={handleRouteOneSetup}
              disabled={
                !isRouteOneValid || formData.routeOneConfig.isConfigured
              }
              variant="contained"
              startIcon={<Settings className="w-4 h-4" />}
            >
              {formData.routeOneConfig.isConfigured
                ? "Configuration Complete"
                : "Setup Configuration"}
            </Button>
          </div>
        )}

        {/* DealerTrack Configuration */}
        {showDealerTrack && (
          <div className="border-l-4 border-brand-secondary pl-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dark-text">
                DealerTrack Configuration
              </h3>
              {formData.dealerTrackConfig.isConfigured && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                  Configured
                </span>
              )}
            </div>

            <TextField
              label="Dealer ID"
              name="dealerId"
              value={formData.dealerTrackConfig.dealerId}
              onChange={handleDealerTrackChange}
              fullWidth
              variant="outlined"
            />

            <TextField
              label="API Key"
              type="password"
              name="apiKey"
              value={formData.dealerTrackConfig.apiKey}
              onChange={handleDealerTrackChange}
              fullWidth
              variant="outlined"
            />

            <Button
              onClick={handleDealerTrackSetup}
              disabled={
                !isDealerTrackValid || formData.dealerTrackConfig.isConfigured
              }
              variant="contained"
              startIcon={<Settings className="w-4 h-4" />}
            >
              {formData.dealerTrackConfig.isConfigured
                ? "Configuration Complete"
                : "Setup Configuration"}
            </Button>
          </div>
        )}

        {/* Import DMS Lenders ID from Credit App Lenders */}
        <div className="border-t border-dark-border pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-dark-text">
              Import DMS Lenders ID from Credit App Lenders
            </h3>
            <Button
              onClick={handleImportDMSLenders}
              variant="contained"
              startIcon={<Download className="w-4 h-4" />}
            >
              Import DMS Lenders
            </Button>
          </div>

          {showDMSLenders && (
            <div className="space-y-2">
              {dmsLendersLoading ? (
                <div className="text-dark-text-secondary py-4">
                  Loading DMS lenders...
                </div>
              ) : (
                dmsLenders?.map((lender) => (
                  <div
                    key={lender.id}
                    className="p-4 bg-dark-bg rounded-lg hover:bg-dark-surface-light transition-all"
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.dmsLenders?.some(
                              (l) => l.id === lender.id
                            ) || false
                          }
                          onChange={() => handleDMSLenderToggle(lender.id)}
                        />
                      }
                      label={
                        <div>
                          <span className="text-dark-text font-medium">
                            {lender.name}
                          </span>
                          <span className="text-dark-text-secondary text-sm ml-2">
                            ({lender.dmsId})
                          </span>
                        </div>
                      }
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Associated Credit App Lenders with Dealerships */}
        <div className="border-t border-dark-border pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-dark-text">
              Associated Credit App Lenders with Dealerships
            </h3>
            <Button
              onClick={handleImportCreditAppLenders}
              disabled={!isConfigurationComplete}
              variant="contained"
              startIcon={<Download className="w-4 h-4" />}
            >
              Import Credit App Lenders
            </Button>
          </div>
        </div>
      </div>
    </StepContainer>
  );
}
