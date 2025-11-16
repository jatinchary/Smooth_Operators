import { getTekionToken } from "./tekionAuth.service.js";
import { logOutgoingRequest } from "../../logging.service.js";
import dotenv from "dotenv";

dotenv.config();

const TEKION_BASE_URI = process.env.TEKION_BASE_URI;
const TEKION_CLIENT_ID = process.env.TEKION_CLIENT_ID;

export async function getDealerSettings(dealerId, requestId) {
  if (!TEKION_BASE_URI || !TEKION_CLIENT_ID) {
    throw new Error("Tekion configuration missing");
  }

  if (!dealerId) {
    throw new Error("Dealer ID is required");
  }

  const token = await getTekionToken();
  if (!token) {
    throw new Error("Failed to obtain Tekion access token");
  }

  const url = `${TEKION_BASE_URI}/api/v2.1/deal/settings`;

  const requestMeta = {
    dealerId,
    startTime: Date.now(),
  };

  const fetchFn = async () => {
    return fetch(url, {
      method: "GET",
      headers: {
        dealerid: dealerId,
        client_id: TEKION_CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const response = await logOutgoingRequest(
    fetchFn,
    "tekion",
    requestId,
    requestMeta
  );

  if (!response.ok) {
    throw new Error(
      `Tekion API error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

export async function getCreditAppLenders(dealerId, requestId) {
  if (!dealerId) {
    throw new Error("Dealer ID is required");
  }

  const settings = await getDealerSettings(dealerId, requestId);

  // Extract fnIs (credit app lenders) from data, fallback to empty array
  const creditAppLenders = settings.data?.fnIs || [];

  if (creditAppLenders.length === 0) {
    console.warn("No credit app lenders found for dealer:", dealerId);
  }

  return creditAppLenders;
}
