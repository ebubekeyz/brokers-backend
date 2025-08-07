#### Create API Docs

### Steps

- [] Export your api from postman or thunder client
- [] Rename file to docs.json
- [] Change all the {{}} to your api url and save
- [] Copy file to desktop
- [] Download docgen from the link below:
- [] https://github.com/thedevsaddam/docgen/releases
- [] Rename downloaded file to docgen
- [] Copy file to desktop
- [] Open cmd.exe and type the commands below:
- [] cd desktop
- [] docgen build -i docs.json -o index.html

### Postman url

- [] https://lunar-space-619555.postman.co/workspace/71be075c-24b4-4fa4-86d8-1165d3610c11/collection/20329755-319803de-74d8-4155-ab55-3668cfa4c489?tab=authorization
  {
  "name": "comfy-server",
  "version": "1.0.0",
  "description": "",
  "main": "app.js",
  "scripts": {
  "start": "node app.js"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5",
  "express": "^4.19.2",
  "express-async-errors": "^3.1.1",
  "express-fileupload": "^1.5.0",
  "helmet": "^7.1.0",
  "http-status-codes": "^2.3.0",
  "jsonwebtoken": "^9.0.2",
  "moment": "^2.30.1",
  "mongoose": "^8.3.2",
  "rate-limiter": "^0.2.0",
  "swagger-ui-express": "^5.0.0",
  "validator": "^13.11.0",
  "xss-clean": "^0.1.4"
  },
  "devDependencies": {
  "nodemon": "^3.1.0"
  }
  }
