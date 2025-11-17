import {
  getDealerSettings,
  getCreditAppLenders,
} from "../services/DMS/Tekion/tekionDeal.service.js";
import { logWithRequestId } from "../services/logging.service.js";
import { query } from "../services/database.service.js";

export const getDealerSettingsController = async (req, res) => {
  const requestId = req.requestId;
  const { dealerId, dealershipId } = req.body;

  if (!dealerId) {
    return res.status(400).json({ error: "dealerId is required" });
  }

  if (!dealershipId) {
    return res.status(400).json({ error: "dealershipId is required" });
  }

  try {
    logWithRequestId("info", "Fetching Tekion dealer settings", requestId, {
      dealerId,
    });

    const settings = await getDealerSettings(dealerId, requestId);

    // Save Tekion settings to dealership_variables
    if (dealershipId && dealerId) {
      // Insert tekion_dealer_id if not exists
      const existingTekion = await query(
        `SELECT id FROM dealership_variables WHERE name = ? AND dealership_id = ? and deleted_at is null`,
        ["tekion_dealer_id", dealershipId]
      );
      if (!existingTekion.rows || existingTekion.rows.length === 0) {
        try {
          await query(
            `INSERT INTO dealership_variables (name, value, client_editable, dealership_id, created_at, updated_at) 
             VALUES (?, ?, ?, ?, NOW(), NOW())`,
            ["tekion_dealer_id", dealerId, 0, dealershipId]
          );
          console.log(
            `Saved tekion_dealer_id ${dealerId} for dealership ${dealershipId}`
          );
        } catch (dbError) {
          console.error(
            `Failed to save tekion_dealer_id for dealership ${dealershipId}:`,
            dbError
          );
        }
      }

      // Insert dms_type if not exists
      const existingDmsType = await query(
        `SELECT id FROM dealership_variables WHERE name = ? AND dealership_id = ? and deleted_at is null`,
        ["dms_type", dealershipId]
      );
      if (!existingDmsType.rows || existingDmsType.rows.length === 0) {
        try {
          await query(
            `INSERT INTO dealership_variables (name, value, client_editable, dealership_id, created_at, updated_at) 
             VALUES (?, ?, ?, ?, NOW(), NOW())`,
            ["dms_type", "Tekion", 0, dealershipId]
          );
          console.log(`Saved dms_type Tekion for dealership ${dealershipId}`);
        } catch (dbError) {
          console.error(
            `Failed to save dms_type for dealership ${dealershipId}:`,
            dbError
          );
        }
      }
    }

    logWithRequestId(
      "info",
      "Successfully fetched Tekion dealer settings",
      requestId,
      { dealerId }
    );

    res.json({
      success: true,
      data: { ...settings, dealershipId },
    });
  } catch (error) {
    logWithRequestId(
      "error",
      "Failed to fetch Tekion dealer settings",
      requestId,
      {
        dealerId,
        error: error.message,
      }
    );

    res.status(500).json({
      success: false,
      error: "Failed to fetch dealer settings",
      message: error.message,
    });
  }
};

export const getCreditAppLendersController = async (req, res) => {
  const requestId = req.requestId;
  const { dealerId } = req.body;

  try {
    logWithRequestId("info", "Fetching Tekion credit app lenders", requestId, {
      dealerId,
    });

    const lenders = await getCreditAppLenders(dealerId, requestId);

    logWithRequestId(
      "info",
      "Successfully fetched Tekion credit app lenders",
      requestId,
      {
        dealerId,
        count: lenders.length,
      }
    );

    res.json({
      success: true,
      data: lenders,
    });
  } catch (error) {
    logWithRequestId(
      "error",
      "Failed to fetch Tekion credit app lenders",
      requestId,
      {
        dealerId,
        error: error.message,
      }
    );

    res.status(500).json({
      success: false,
      error: "Failed to fetch credit app lenders",
      message: error.message,
    });
  }
};
