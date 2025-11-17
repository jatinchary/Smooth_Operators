import { useState, useMemo } from "react";
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
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";
import Pagination from "@mui/material/Pagination";
import InputAdornment from "@mui/material/InputAdornment";
import { Settings, Download, Search, Save } from "lucide-react";
import { fetchCreditAppLenders } from "./helpers/tekionApi";

const providers = ["RouteOne", "DealerTrack", "Both"];

export default function Step2FinanceProviders() {
  const dispatch = useDispatch();
  const financeProviders = useSelector(
    (state) => state.config.financeProviders
  );
  const generalInfo = useSelector((state) => state.config.generalInfo);
  const dmsIntegrations = useSelector((state) => state.config.dmsIntegrations);
  const currentTheme = useSelector((state) => state.config.theme || 'gold');

  const [formData, setFormData] = useState({
    ...financeProviders,
    viaLP: true,
    routeOneConfig: {},
    dealerTrackConfig: {},
  });
  const [showDMSLenders, setShowDMSLenders] = useState(false);
  const [dmsLendersDealerId, setDmsLendersDealerId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
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

  // Fetch DMS Lenders
  const { data: dmsLenders, isLoading: dmsLendersLoading } = useQuery({
    queryKey: ["dmsLenders", dmsLendersDealerId],
    queryFn: () => fetchCreditAppLenders(dmsLendersDealerId),
    enabled: showDMSLenders && !!dmsLendersDealerId,
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
      const errorMsg =
        "Dealership ID not selected in General Info. Please go back and select a dealership.";
      showToast("error", errorMsg);
      return;
    }

    if (!formData.routeOneConfig.dealerId) {
      const errorMsg = "Please enter a Dealer ID for RouteOne.";
      showToast("error", errorMsg);
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
      showToast("success", "RouteOne configuration setup successfully!");
    } catch (error) {
      console.error("RouteOne setup error:", error);
      const errorMsg =
        error.message ||
        "Failed to setup RouteOne configuration. Please try again.";
      showToast("error", errorMsg);
    }
  };

  const handleDealerTrackSetup = async () => {
    const dealershipId = generalInfo?.selectedDealershipId;
    if (!dealershipId) {
      const errorMsg =
        "Dealership ID not selected in General Info. Please go back and select a dealership.";
      showToast("error", errorMsg);
      return;
    }

    if (
      !formData.dealerTrackConfig.dealerId ||
      !formData.dealerTrackConfig.apiKey
    ) {
      const errorMsg =
        "Please enter both Dealer ID and API Key for DealerTrack.";
      showToast("error", errorMsg);
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
      showToast("success", "DealerTrack configuration setup successfully!");
    } catch (error) {
      console.error("DealerTrack setup error:", error);
      const errorMsg =
        error.message ||
        "Failed to setup DealerTrack configuration. Please try again.";
      showToast("error", errorMsg);
    }
  };

  const handleImportDMSLenders = () => {
    // Check if DMS is configured in Step 4
    const dmsDealerId = dmsIntegrations?.dealerId;

    if (!dmsDealerId) {
      showToast(
        "error",
        "Please configure DMS integration in Step 4 first before importing DMS lenders."
      );
      return;
    }

    setDmsLendersDealerId(dmsDealerId);
    setShowDMSLenders(true);
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Filter and paginate lenders
  const filteredLenders = useMemo(() => {
    if (!dmsLenders) return [];

    return dmsLenders.filter((lender) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        lender.name?.toLowerCase().includes(searchLower) ||
        lender.lienHolder?.toLowerCase().includes(searchLower) ||
        lender.code?.toLowerCase().includes(searchLower) ||
        lender.lienHolderAddress?.city?.toLowerCase().includes(searchLower) ||
        lender.lienHolderAddress?.state?.toLowerCase().includes(searchLower)
      );
    });
  }, [dmsLenders, searchQuery]);

  const paginatedLenders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLenders.slice(startIndex, endIndex);
  }, [filteredLenders, currentPage]);

  const totalPages = Math.ceil(filteredLenders.length / itemsPerPage);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (_, value) => {
    setCurrentPage(value);
  };

  const handleImportCreditAppLenders = async () => {
    const dealershipId = generalInfo?.selectedDealershipId;
    if (!dealershipId) {
      const errorMsg =
        "Dealership ID not selected in General Info. Please go back and select a dealership.";
      showToast("error", errorMsg);
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
      const errorMsg = "No provider selected";
      showToast("error", errorMsg);
      return;
    }

    if (!interfaceOrgId) {
      const errorMsg = "Provider dealer ID not configured";
      showToast("error", errorMsg);
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
      showToast("success", "Credit app lenders imported successfully!");
    } catch (error) {
      console.error("Import credit app lenders error:", error);
      const errorMsg =
        error.message ||
        "Failed to import credit app lenders. Please try again.";
      showToast("error", errorMsg);
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

  const handleSaveLenders = async () => {
    const dealershipId = generalInfo?.selectedDealershipId;
    if (!dealershipId) {
      const errorMsg =
        "Dealership ID not selected in General Info. Please go back and select a dealership.";
      showToast("error", errorMsg);
      return;
    }

    const selectedLenders = formData.dmsLenders || [];
    if (selectedLenders.length === 0) {
      const errorMsg = "Please select at least one lender to save.";
      showToast("error", errorMsg);
      return;
    }

    try {
      const response = await fetch("/api/save-credit-app-lenders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dealershipId,
          lenders: selectedLenders,
        }),
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Save lenders response:", data);

      const successMsg = `Successfully saved ${data.data.saved} lender(s)${
        data.data.failed > 0 ? ` (${data.data.failed} failed)` : ""
      }`;
      showToast("success", successMsg);
    } catch (error) {
      console.error("Save lenders error:", error);
      const errorMsg =
        error.message || "Failed to save lenders. Please try again.";
      showToast("error", errorMsg);
    }
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
            />
          }
          label={<span style={{ color: currentTheme === 'blue' ? '#1f2937' : '#e5e7eb', fontSize: '0.875rem', fontWeight: 500 }}>Via Lending Platform</span>}
          sx={{
            padding: "16px",
            backgroundColor: currentTheme === 'blue' ? '#ffffff' : '#1a1d25',
            borderRadius: "8px",
            border: currentTheme === 'blue' ? '1px solid #e5e7eb' : '1px solid #3d4354',
            width: "100%",
            margin: 0,
            justifyContent: "space-between",
            marginLeft: 0,
            '& .MuiFormControlLabel-label': {
              color: currentTheme === 'blue' ? '#1f2937' : '#e5e7eb',
              fontSize: '0.875rem',
              fontWeight: 500,
              opacity: '1 !important',
              visibility: 'visible !important',
              display: 'block',
            },
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
                <span className="px-3 py-1 bg-brand-focus/20 text-brand-focus text-sm rounded-full">
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

            <div className="flex justify-end">
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
          </div>
        )}

        {/* DealerTrack Configuration */}
        {showDealerTrack && (
          <div className="border-l-4 border-brand-focus pl-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dark-text">
                DealerTrack Configuration
              </h3>
              {formData.dealerTrackConfig.isConfigured && (
                <span className="px-3 py-1 bg-brand-focus/20 text-brand-focus text-sm rounded-full">
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
            <div className="flex gap-2">
              <Button
                onClick={handleImportDMSLenders}
                variant="contained"
                startIcon={<Download className="w-4 h-4" />}
              >
                Import DMS Lenders
              </Button>
              {showDMSLenders && formData.dmsLenders?.length > 0 && (
                <Button
                  onClick={handleSaveLenders}
                  variant="contained"
                  color="success"
                  startIcon={<Save className="w-4 h-4" />}
                >
                  Save Lenders ({formData.dmsLenders.length})
                </Button>
              )}
            </div>
          </div>

          {showDMSLenders && (
            <div className="space-y-4">
              {dmsLendersLoading ? (
                <div className="text-dark-text-secondary py-4">
                  Loading DMS lenders...
                </div>
              ) : (
                <>
                  {/* Search Box */}
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search lenders by name, lien holder, code, city, or state..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search className="w-5 h-5 text-dark-text-secondary" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Results Info */}
                  <div className="text-dark-text-secondary text-sm">
                    Showing {paginatedLenders.length} of{" "}
                    {filteredLenders.length} lenders
                    {searchQuery &&
                      ` (filtered from ${dmsLenders?.length || 0} total)`}
                  </div>

                  {/* Lenders List */}
                  <div className="space-y-2">
                    {paginatedLenders.length > 0 ? (
                      paginatedLenders.map((lender) => (
                        <div
                          key={lender.id}
                          onClick={() => handleDMSLenderToggle(lender.id)}
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDMSLenderToggle(lender.id);
                                }}
                              />
                            }
                            onClick={() => handleDMSLenderToggle(lender.id)}
                            label={
                              <div>
                                <div className="text-dark-text font-medium">
                                  {lender.name}
                                </div>
                                <div className="text-dark-text-secondary text-sm">
                                  {lender.lienHolder && (
                                    <span className="mr-3">
                                      Lien Holder: {lender.lienHolder}
                                    </span>
                                  )}
                                  {lender.code && (
                                    <span className="mr-3">
                                      Code: {lender.code}
                                    </span>
                                  )}
                                  {lender.lienHolderAddress?.city && (
                                    <span className="mr-3">
                                      {lender.lienHolderAddress.city}
                                      {lender.lienHolderAddress?.state &&
                                        `, ${lender.lienHolderAddress.state}`}
                                    </span>
                                  )}
                                </div>
                              </div>
                            }
                          />
                        </div>
                      ))
                    ) : (
                      <div className="text-dark-text-secondary text-center py-8">
                        {searchQuery
                          ? "No lenders found matching your search."
                          : "No lenders available."}
                      </div>
                    )}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-4">
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                      />
                    </div>
                  )}
                </>
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
              Associate Lenders with Dealership
            </Button>
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
