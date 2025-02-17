import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import parseReceiptRoute from './routes/ParseReceipt.js'; // Import the router
import priceListRoute from './routes/PriceList.js'; // Import the router

const app = express();
const port = 3333;

app.use(cors());
app.use(helmet());


app.use('/api/parse-receipt', parseReceiptRoute); // Use the imported router
app.use('/api/price-list', priceListRoute); // Use a distinct path for priceListRoute

app.listen({ host: '0.0.0.0', port: process.env.PORT ?? 3333 }, () => {
  console.log(`Server started on http://localhost:${port}`);
});