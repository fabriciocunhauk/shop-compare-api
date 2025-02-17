import express from 'express';
import multer from 'multer';
import { ParseReceiptController } from '../controllers/ParseReceiptController.js'

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage }); 

router.post('/', upload.single('file'), ParseReceiptController );

export default router;