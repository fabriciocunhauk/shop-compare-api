import { deleteImage, insertSupermarketData, insertImage } from "../models/database-postgres.js"; // Import insertImage
import { extractTextFromImage } from "../utils/extractTextFromImage.js";
import { parseExtractedText } from "../utils/parseExtractedText.js";

export async function ParseReceiptController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const result = await insertImage(req.file.buffer);

    if (!result || result.length === 0 || !result[0].data || !result[0].id) {
        return res.status(500).json({error:"image insertion failed or returned invalid data."});
    }

    const image = result[0].data;

    const extractedText = await extractTextFromImage(image);
    const parsedData = parseExtractedText(extractedText);

    if (parsedData && parsedData.items && parsedData.supermarket){
      for (const item of parsedData.items) {
          await insertSupermarketData(parsedData.supermarket, item.name, parseFloat(item.price.replace('£', '')));
      }

      await deleteImage(result[0].id);
      res.status(200).json(parsedData);
    } else {
      res.status(500).json({error:"parsed data invalid"});
    }
  } catch (error) {
    console.error("Error processing receipt:", error);
    res.status(500).json({ error: 'An error occurred while processing the receipt.' });
  }
}