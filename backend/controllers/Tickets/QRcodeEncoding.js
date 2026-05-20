import { asyncHandler } from "../../utils/asyncHandler";
import QRcode from 'qrcode'

import QRCode from "qrcode";

export const generateQRCode = async (ticketId, qrToken) => {
  try {

    const qrData = `${ticketId}.${qrToken}`;

    const qrDataURL = await QRCode.toDataURL(qrData);

    return qrDataURL;

  } catch (error) {
    console.log("QR generation error:", error);
    throw error;
  }
};