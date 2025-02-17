import { getPriceList } from "../models/database-postgres.js";

export async function PriceListController(req, res) {
    try {
    const priceList = await getPriceList();

    res.status(200).json(priceList);
  } catch (error) {
    console.error("Error getting price list:", error); 
    res.status(500).json({ error: 'An error occurred while getting price list.' });
  }
}