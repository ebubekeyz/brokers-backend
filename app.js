require('dotenv').config();
require('express-async-errors');

const connectDB = require('./db/connect.js');

const express = require('express');
const app = express();

const path = require('path');

const authRouter = require('./routes/authRouter.js');
const axios = require('axios');




const uploadRouter = require('./routes/uploadRouter.js');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary');
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const errorHandlerMiddleware = require('./middleware/error-handler');
const notFoundMiddleware = require('./middleware/not-found');

const cors = require('cors');
const xss = require('xss-clean');
const helmet = require('helmet');

// let originUrl =
//   process.env.NODE_ENV !== 'production'
//     ? 'http://localhost:5173'
//     : 'https://pledgebank-inc.com';

let originUrl =
  process.env.NODE_ENV !== 'production'
    ? 'http://localhost:5173'
    : 'https://brokers-real.netlify.app';


app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(xss())

app.use(
  cors({
    origin: originUrl,
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(express.static('./public'));
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));

app.use('/api/auth', authRouter);
app.use('/api/investment', require('./routes/InvestmentRouter'));
app.use('/api/investment-products', require('./routes/InvestmentProductRouter'));
app.use('/api/withdraws', require('./routes/withdrawRouter'));
app.use('/api/kyc', require('./routes/KycRouter'));
app.use('/api/notifications', require('./routes/notificationRouter'));
app.use('/api/profits', require('./routes/ProfitRouter'));
app.use('/api/transactions', require('./routes/TransactionRouter'));
app.use('/api/settings', require('./routes/SettingsRouter'));
app.use('/api/support-tickets', require('./routes/SupportTicketRouter'));
app.use('/api/upload-receipt', require('./routes/UploadReceiptRouter'));
app.use('/api/deposit', require('./routes/DepositRouter'));

app.get("/order/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const response = await axios.get(`https://staging-api.transak.com/api/v2/orders/${orderId}`, {
      headers: {
        "apiKey": process.env.TRANSAK_SANDBOX_API_KEY, // from your dashboard
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});




const API_KEY = process.env.TRANSAK_SANDBOX_API_KEY || "";
const API_SECRET = process.env.TRANSAK_SANDBOX_API_SECRET;



app.get("/orders", async (req, res) => {
  try {
    const r = await fetch("https://api-staging.transak.com/api/v2/orders", {
      headers: {
        "apiKey": API_KEY,
        "secret": API_SECRET,
      },
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.use('/api/upload', uploadRouter);



// test2

app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);

const port = process.env.PORT || 7000;

const start = async () => {
  await connectDB(process.env.MONGO_URI);
  app.listen(port, () => console.log(`Server listening on port ${port}`));
};

start();
