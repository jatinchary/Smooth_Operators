import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateGeneralInfo } from "../../store/slices/configSlice";
import StepContainer from "./StepContainer";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Slide from "@mui/material/Slide";
import {
  fetchDealershipOptions,
  fetchDealershipDetails,
  saveDealership,
} from "./helpers/dealersApi";

export default function Step1GeneralInfo() {
  const dispatch = useDispatch();
  const generalInfo = useSelector((state) => state.config.generalInfo);

  const [formData, setFormData] = useState(generalInfo);
  const [errors, setErrors] = useState({});
  const [dealershipOptions, setDealershipOptions] = useState([]);
  const [dealershipsError, setDealershipsError] = useState("");
  const [isLoadingDealerships, setIsLoadingDealerships] = useState(false);
  const [isImportingDealership, setIsImportingDealership] = useState(false);
  const [selectedDealershipName, setSelectedDealershipName] = useState("");
  const [selectedDealershipId, setSelectedDealershipId] = useState("");
  const [isSavingDealership, setIsSavingDealership] = useState(false);
  const [saveDealershipError, setSaveDealershipError] = useState("");
  const [saveDealershipSuccess, setSaveDealershipSuccess] = useState(false);
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
  const STATE_ABBREVIATION_TO_ID = {
    AL: 1,
    AK: 2,
    AZ: 4,
    AR: 5,
    CA: 6,
    CO: 8,
    CT: 9,
    DE: 10,
    DC: 11,
    FL: 12,
    GA: 13,
    HI: 15,
    ID: 16,
    IL: 17,
    IN: 18,
    IA: 19,
    KS: 20,
    KY: 21,
    LA: 22,
    ME: 23,
    MD: 24,
    MA: 25,
    MI: 26,
    MN: 27,
    MS: 28,
    MO: 29,
    MT: 30,
    NE: 31,
    NV: 32,
    NH: 33,
    NJ: 34,
    NM: 35,
    NY: 36,
    NC: 37,
    ND: 38,
    OH: 39,
    OK: 40,
    OR: 41,
    PA: 42,
    RI: 44,
    SC: 45,
    SD: 46,
    TN: 47,
    TX: 48,
    UT: 49,
    VT: 50,
    VA: 51,
    WA: 53,
    WV: 54,
    WI: 55,
    WY: 56,
  };

  // Reverse mapping: ID to abbreviation
  const ID_TO_STATE_ABBREVIATION = {
    1: "AL",
    2: "AK",
    4: "AZ",
    5: "AR",
    6: "CA",
    8: "CO",
    9: "CT",
    10: "DE",
    11: "DC",
    12: "FL",
    13: "GA",
    15: "HI",
    16: "ID",
    17: "IL",
    18: "IN",
    19: "IA",
    20: "KS",
    21: "KY",
    22: "LA",
    23: "ME",
    24: "MD",
    25: "MA",
    26: "MI",
    27: "MN",
    28: "MS",
    29: "MO",
    30: "MT",
    31: "NE",
    32: "NV",
    33: "NH",
    34: "NJ",
    35: "NM",
    36: "NY",
    37: "NC",
    38: "ND",
    39: "OH",
    40: "OK",
    41: "OR",
    42: "PA",
    44: "RI",
    45: "SC",
    46: "SD",
    47: "TN",
    48: "TX",
    49: "UT",
    50: "VT",
    51: "VA",
    53: "WA",
    54: "WV",
    55: "WI",
    56: "WY",
  };

  useEffect(() => {
    setFormData(generalInfo);
  }, [generalInfo]);

  useEffect(() => {
    let isMounted = true;

    const loadDealerships = async () => {
      setIsLoadingDealerships(true);
      setDealershipsError("");
      try {
        const options = await fetchDealershipOptions();
        if (isMounted) {
          setDealershipOptions(options);
        }
      } catch (error) {
        console.error("Failed to load dealerships", error);
        if (isMounted) {
          setDealershipsError(error.message || "Failed to load dealerships");
        }
      } finally {
        if (isMounted) {
          setIsLoadingDealerships(false);
        }
      }
    };

    loadDealerships();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedDealershipId && dealershipOptions.length > 0) {
      setSelectedDealershipId(String(dealershipOptions[0].id));
    }
  }, [dealershipOptions, selectedDealershipId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSaveDealershipSuccess(false);

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Validate ZIP code
    if (name === "zipCode" && value) {
      if (!/^\d{5}$/.test(value) && value.length === 5) {
        setErrors((prev) => ({ ...prev, zipCode: "Not a valid zip" }));
      }
    }
  };

  const handleImportDealership = async () => {
    if (!selectedDealershipId) {
      const errorMsg = "Select a dealership to import";
      setDealershipsError(errorMsg);
      showToast("error", errorMsg);
      return;
    }

    const selectedOption = dealershipOptions.find(
      (option) => String(option.id) === String(selectedDealershipId)
    );

    setIsImportingDealership(true);
    setDealershipsError("");

    try {
      const details = await fetchDealershipDetails(selectedDealershipId);

      // Convert stateId to state abbreviation if needed
      let stateValue = details.state || "";
      if (details.stateId && !stateValue) {
        // If we have a stateId but no state abbreviation, convert it
        stateValue = ID_TO_STATE_ABBREVIATION[details.stateId] || "";
      } else if (stateValue && !isNaN(stateValue)) {
        // If state contains a numeric ID, convert it to abbreviation
        stateValue = ID_TO_STATE_ABBREVIATION[Number(stateValue)] || stateValue;
      }

      const updatedFormData = {
        ...details,
        state: stateValue,
        selectedDealershipId,
        selectedDealershipName: selectedOption?.name || "",
      };
      setFormData(updatedFormData);
      dispatch(updateGeneralInfo(updatedFormData));
      setErrors({});
      setSelectedDealershipName(selectedOption?.name || "");
      showToast(
        "success",
        `Dealership "${
          selectedOption?.name || "selected"
        }" imported successfully.`
      );
    } catch (error) {
      console.error("Failed to import dealership", error);
      const errorMsg = error.message || "Failed to import dealership";
      setDealershipsError(errorMsg);
      showToast("error", `Error importing dealership: ${errorMsg}`);
    } finally {
      setIsImportingDealership(false);
    }
  };

  const handleSaveDealership = async () => {
    const stateAbbr = (formData.state || "").trim().toUpperCase();
    const stateId =
      formData.stateId ||
      (stateAbbr ? STATE_ABBREVIATION_TO_ID[stateAbbr] ?? null : null);

    if (!stateId) {
      const errorMsg = "Select a valid state before saving the dealership.";
      setSaveDealershipError(errorMsg);
      showToast("error", errorMsg);
      return;
    }

    const payload = {
      name: formData.legalName || formData.dbaName || "",
      legal_name: formData.legalName || "",
      dba_name: formData.dbaName || "",
      address: formData.address1 || "",
      address_2: formData.address2 || "",
      city: formData.city || "",
      state_id: stateId,
      state: stateAbbr || undefined,
      zip_code: formData.zipCode || "",
      phone: formData.phone || "",
      fax: formData.fax || "",
      email: formData.email || "",
      website: formData.website || "",
      dms_code: formData.dmsCode || "",
      dms_number: formData.dmsNumber || "",
    };

    setIsSavingDealership(true);
    setSaveDealershipError("");
    setSaveDealershipSuccess(false);

    try {
      const response = await saveDealership(payload);
      const savedDealership = response?.dealership;

      const savedName =
        savedDealership?.displayName ||
        savedDealership?.name ||
        payload.name ||
        "";

      if (savedName) {
        setSelectedDealershipName(savedName);
      }

      if (savedDealership?.id) {
        setSelectedDealershipId(String(savedDealership.id));
        setDealershipOptions((prev) => {
          const optionName =
            savedDealership.displayName ||
            savedDealership.name ||
            `Dealership ${savedDealership.id}`;

          const newOption = { id: savedDealership.id, name: optionName };
          const exists = prev.some(
            (option) => String(option.id) === String(savedDealership.id)
          );
          return exists
            ? prev.map((option) =>
                String(option.id) === String(savedDealership.id)
                  ? newOption
                  : option
              )
            : [...prev, newOption];
        });
      }

      setSaveDealershipSuccess(true);
      showToast("success", "Dealership saved successfully.");
    } catch (error) {
      console.error("Failed to save dealership", error);
      setSaveDealershipError(error.message || "Failed to save dealership");
      showToast(
        "error",
        `Error saving dealership: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsSavingDealership(false);
    }
  };

  const handleNext = () => {
    const updatedGeneralInfo = {
      ...formData,
      selectedDealershipId,
      selectedDealershipName,
    };
    dispatch(updateGeneralInfo(updatedGeneralInfo));
  };

  // Require at least Legal Name and Email
  const isValid = formData.legalName && formData.email;
  const canSaveDealership =
    (formData.legalName || formData.dbaName) &&
    formData.address1 &&
    formData.city &&
    formData.zipCode &&
    formData.state;

  return (
    <StepContainer
      stepNumber={1}
      title="Dealership Information"
      onNext={handleNext}
      canGoNext={isValid}
      headerActions={
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <TextField
            select
            label="Select Dealership"
            value={selectedDealershipId}
            onChange={(event) => {
              setSelectedDealershipId(event.target.value);
              setDealershipsError("");
            }}
            size="small"
            sx={{ minWidth: 220 }}
            disabled={isLoadingDealerships}
            SelectProps={{
              displayEmpty: true,
            }}
          >
            {isLoadingDealerships ? (
              <MenuItem value="" disabled>
                <CircularProgress size={18} sx={{ mr: 2 }} />
                Loading dealerships...
              </MenuItem>
            ) : dealershipOptions.length > 0 ? (
              dealershipOptions.map((dealer) => (
                <MenuItem key={dealer.id} value={String(dealer.id)}>
                  {dealer.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled>
                {dealershipsError || "No dealerships found"}
              </MenuItem>
            )}
          </TextField>
          <Button
            variant="contained"
            onClick={handleImportDealership}
            disabled={
              isImportingDealership ||
              isLoadingDealerships ||
              !selectedDealershipId ||
              dealershipOptions.length === 0
            }
            size="large"
            sx={{ px: 4 }}
            startIcon={
              isImportingDealership ? <CircularProgress size={18} /> : null
            }
          >
            Import Dealership
          </Button>
        </Stack>
      }
    >
      <div className="space-y-6">
        {dealershipsError && (
          <Alert severity="error" onClose={() => setDealershipsError("")}>
            {dealershipsError}
          </Alert>
        )}
        {saveDealershipError && (
          <Alert severity="error" onClose={() => setSaveDealershipError("")}>
            {saveDealershipError}
          </Alert>
        )}
        {saveDealershipSuccess && (
          <Alert
            severity="success"
            onClose={() => setSaveDealershipSuccess(false)}
          >
            {selectedDealershipName
              ? `Dealership "${selectedDealershipName}" saved successfully.`
              : "Dealership information saved successfully."}
          </Alert>
        )}

        {/* Row 1: Legal Name, DBA Name */}
        <Grid container spacing={2} justifyContent="space-between">
          <Grid item xs={12} md sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              label="Legal Name"
              name="legalName"
              value={formData.legalName || ""}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              label="DBA Name"
              name="dbaName"
              value={formData.dbaName || ""}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Grid>
        </Grid>

        {/* Row 2: Website, Email, Phone, Fax */}
        <Stack direction="row" spacing={2}>
          <TextField
            label="Website"
            type="url"
            name="website"
            value={formData.website || ""}
            onChange={handleChange}
            fullWidth
            sx={{ flex: 1 }}
            variant="outlined"
          />
          <TextField
            label="Email"
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            required
            fullWidth
            sx={{ flex: 1 }}
            variant="outlined"
          />
          <TextField
            label="Phone"
            type="tel"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            fullWidth
            sx={{ flex: 1 }}
            variant="outlined"
          />
          <TextField
            label="FAX"
            name="fax"
            value={formData.fax || ""}
            onChange={handleChange}
            fullWidth
            sx={{ flex: 1 }}
            variant="outlined"
          />
        </Stack>

        {/* Row 4: Address 1 */}
        <TextField
          label="Address 1"
          name="address1"
          value={formData.address1 || ""}
          onChange={handleChange}
          fullWidth
          variant="outlined"
        />

        {/* Row 5: Address 2 */}
        <TextField
          label="Address 2"
          name="address2"
          value={formData.address2 || ""}
          onChange={handleChange}
          fullWidth
          variant="outlined"
        />

        {/* Row 3: Country, State, City, ZIP Code */}
        <Grid container spacing={2} justifyContent="space-between">
          <Grid item xs={12} md sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              label="Country"
              name="country"
              value={formData.country || ""}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              select
              label="State"
              name="state"
              value={formData.state || ""}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  if (!selected) {
                    return (
                      <span style={{ color: "#9ca3af" }}>Select State</span>
                    );
                  }
                  return selected;
                },
              }}
              InputLabelProps={{
                shrink: true,
              }}
            >
              <MenuItem value="" disabled>
                Select State
              </MenuItem>
              <MenuItem value="AL">AL</MenuItem>
              <MenuItem value="AK">AK</MenuItem>
              <MenuItem value="AZ">AZ</MenuItem>
              <MenuItem value="AR">AR</MenuItem>
              <MenuItem value="CA">CA</MenuItem>
              <MenuItem value="CO">CO</MenuItem>
              <MenuItem value="CT">CT</MenuItem>
              <MenuItem value="DE">DE</MenuItem>
              <MenuItem value="FL">FL</MenuItem>
              <MenuItem value="GA">GA</MenuItem>
              <MenuItem value="HI">HI</MenuItem>
              <MenuItem value="ID">ID</MenuItem>
              <MenuItem value="IL">IL</MenuItem>
              <MenuItem value="IN">IN</MenuItem>
              <MenuItem value="IA">IA</MenuItem>
              <MenuItem value="KS">KS</MenuItem>
              <MenuItem value="KY">KY</MenuItem>
              <MenuItem value="LA">LA</MenuItem>
              <MenuItem value="ME">ME</MenuItem>
              <MenuItem value="MD">MD</MenuItem>
              <MenuItem value="MA">MA</MenuItem>
              <MenuItem value="MI">MI</MenuItem>
              <MenuItem value="MN">MN</MenuItem>
              <MenuItem value="MS">MS</MenuItem>
              <MenuItem value="MO">MO</MenuItem>
              <MenuItem value="MT">MT</MenuItem>
              <MenuItem value="NE">NE</MenuItem>
              <MenuItem value="NV">NV</MenuItem>
              <MenuItem value="NH">NH</MenuItem>
              <MenuItem value="NJ">NJ</MenuItem>
              <MenuItem value="NM">NM</MenuItem>
              <MenuItem value="NY">NY</MenuItem>
              <MenuItem value="NC">NC</MenuItem>
              <MenuItem value="ND">ND</MenuItem>
              <MenuItem value="OH">OH</MenuItem>
              <MenuItem value="OK">OK</MenuItem>
              <MenuItem value="OR">OR</MenuItem>
              <MenuItem value="PA">PA</MenuItem>
              <MenuItem value="RI">RI</MenuItem>
              <MenuItem value="SC">SC</MenuItem>
              <MenuItem value="SD">SD</MenuItem>
              <MenuItem value="TN">TN</MenuItem>
              <MenuItem value="TX">TX</MenuItem>
              <MenuItem value="UT">UT</MenuItem>
              <MenuItem value="VT">VT</MenuItem>
              <MenuItem value="VA">VA</MenuItem>
              <MenuItem value="WA">WA</MenuItem>
              <MenuItem value="WV">WV</MenuItem>
              <MenuItem value="WI">WI</MenuItem>
              <MenuItem value="WY">WY</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              label="City"
              name="city"
              value={formData.city || ""}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              label="ZIP Code"
              name="zipCode"
              value={formData.zipCode || ""}
              onChange={handleChange}
              inputProps={{ maxLength: 5 }}
              error={!!errors.zipCode}
              helperText={errors.zipCode}
              fullWidth
              variant="outlined"
            />
          </Grid>
        </Grid>

        <div className="border-t border-dark-border pt-6 space-y-3">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent={{ xs: "flex-start", sm: "flex-end" }}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={handleSaveDealership}
              disabled={
                isSavingDealership || !canSaveDealership || isLoadingDealerships
              }
              startIcon={
                isSavingDealership ? (
                  <CircularProgress size={18} color="inherit" />
                ) : null
              }
            >
              {isSavingDealership ? "Saving..." : "Save Dealership"}
            </Button>
          </Stack>
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
