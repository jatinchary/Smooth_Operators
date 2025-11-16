import { getDealerSettings } from "../services/DMS/Tekion/tekionDeal.service.js";
import { logWithRequestId } from "../services/logging.service.js";

export const getDealerSettingsController = async (req, res) => {
  const requestId = req.requestId;
  const { dealerId } = req.body;

  try {
    logWithRequestId("info", "Fetching Tekion dealer settings", requestId, {
      dealerId,
    });

    const settings = await getDealerSettings(dealerId, requestId);

    logWithRequestId(
      "info",
      "Successfully fetched Tekion dealer settings",
      requestId,
      { dealerId }
    );

    res.json({
      success: true,
      data: settings,
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
