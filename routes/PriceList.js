
import express from 'express';
import  { PriceListController } from '../controllers/PriceListController.js'

const router = express.Router();

router.get('/', PriceListController);

export default router;