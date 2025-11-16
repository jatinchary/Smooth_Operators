import { useSelector, useDispatch } from "react-redux";
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
import { Package } from "lucide-react";
import VendorManagement from "./ProductImport/VendorManagement";
import ProductImport from "./ProductImport/ProductImport";
import ProductConfiguration from "./ProductImport/ProductConfiguration";

export default function Step3Products() {
  const dispatch = useDispatch();
  const productsState = useSelector((state) => state.products);

  const handleIntegrationChange = (value) => {
    dispatch(setProductIntegration(value));
  };

  const handleDealerIdChange = (e) => {
    dispatch(setDealerId(e.target.value));
  };

  const isValid = productsState.dealerId;

  return (
    <StepContainer stepNumber={3} title="Products" canGoNext={isValid}>
      <div className="space-y-8">
        {/* Product Integration Selection */}
        <div>
          <label className="block text-dark-text font-medium mb-3 flex items-center gap-2">
            <Package
              className="w-5 h-5"
              style={{ color: "rgb(231 233 187 / var(--tw-text-opacity))" }}
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
      </div>
    </StepContainer>
  );
}
