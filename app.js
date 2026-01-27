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
    : 'https://brokers-main.netlify.app';


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
app.use('/api/cryptoOrders', require('./routes/OrderRouter'));

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










app.post("/postOrders", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api-stg.transak.com/partners/api/v2/refresh-token",
      { apiKey: "199e0c9b-9315-4e82-a14d-8bca37d6d94e" },
      {
        headers: {
          accept: "application/json",
          "api-secret": "/91GDRzJ3PdNqp/afREiEQ==",
          "content-type": "application/json",
        },
      }
    );

    console.log(response.data); // token response
    res.json(response.data); // send back to client
  } catch (err) {
    if (err.response) {
      console.error("API Error:", err.response.status, err.response.data);
      res.status(err.response.status).json(err.response.data);
    } else {
      console.error("Request Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  }
});





	
// app.get(`/api/orders`, async (req, res) => {
  // const walletAddress = req.user.walletAddress || ''
  console.log
  // try {
  //   const { data } = await axios.get(
  //     `https://api-stg.transak.com/partners/api/v2/orders?filter[walletAddress]=${walletAddress}&limit=100&skip=0`,
  //     {
  //       headers: {
  //         accept: "application/json",
  //         "access-token":
  //           "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBUElfS0VZIjoiMTk5ZTBjOWItOTMxNS00ZTgyLWExNGQtOGJjYTM3ZDZkOTRlIiwiaWF0IjoxNzU1MTY1OTMzLCJleHAiOjE3NTU3NzA3MzN9.W4UjJBwT-Tb0K_goeto6Q-KbSl9bywS1tGM_7GNJ-Zk",
  //       },
  //     }
  //   );

  //   console.log(data); // Logs the API response
  //   res.json(data); // Sends it back to the frontend
  // } catch (err) {
  //   if (err.response) {
  //     console.error(
  //       "Transak API Error:",
  //       err.response.status,
  //       err.response.data
  //     );
  //     res
  //       .status(err.response.status)
  //       .json({ error: err.response.data });
  //   } else {
  //     console.error("Server error:", err.message);
  //     res.status(500).json({ error: "Failed to fetch orders" });
  //   }
  // }
// });

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
