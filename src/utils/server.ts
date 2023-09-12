import { Application } from "express";
import express from 'express';
import bodyParser from "body-parser";


export const startServer = () => {
  const app: Application = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  const PORT = process.env.PORT || 8000;

  app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
  });
}

module.exports = startServer;



