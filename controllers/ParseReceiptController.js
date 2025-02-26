import { deleteImage, insertSupermarketData, insertImage } from "../models/database-postgres.js";
import { extractTextFromImage } from "../utils/extractTextFromImage.js";
import { parseExtractedText } from "../utils/parseExtractedText.js";

async function saveSupermarketData(supermarket, items) {
  for (const item of items) {
    const price = parseFloat(item.price.replace('£', ''));
    await insertSupermarketData(supermarket, item.name, price);
  }
}

export async function ParseReceiptController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const imageResult = await insertImage(req.file.buffer);
    if (!imageResult?.[0]?.data || !imageResult?.[0]?.id) {
      return res.status(500).json({ error: "Failed to process the uploaded image." });
    }

    const { data: image, id: imageId } = imageResult[0];

    const extractedText = await extractTextFromImage(image);
    const parsedData = parseExtractedText(extractedText);

    if (!parsedData?.items || !parsedData?.supermarket) {
      await deleteImage(imageId); 
      return res.status(500).json({ error: "Receipt not uploaded. Please Follow the instructions and try again!" });
    }

    await saveSupermarketData(parsedData.supermarket, parsedData.items);

    await deleteImage(imageId);

    return res.status(200).json(parsedData);
  } catch (error) {
    console.error("Error processing receipt:", error);
    return res.status(500).json({ error: "An error occurred while processing the receipt." });
  }
}