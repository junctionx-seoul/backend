import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';

import helmet from 'helmet';
import cors from 'cors';
import bearerToken from 'express-bearer-token';

import { errorHandler } from './middlewares';

import RootRouter from './routes';
import AuthRouter from './routes/auth';
import ExhibitionRouter from './routes/exhibition';
import PieceRouter from './routes/piece';
import SubscribeRouter from './routes/subscribe';
import LikeRouter from './routes/like';
import ReviewRouter from './routes/review';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();

    this.initializeMiddlewares();
    this.connectMongoDB();
    this.initializeRouter();
    this.initialErrorHandler();
  }

  private initializeMiddlewares() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(
      bearerToken({
        bodyKey: 'token',
        headerKey: 'Bearer',
      }),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  private connectMongoDB() {
    const certFileBuf = fs.readFileSync(
      'src/credentials/rds-combined-ca-bundle.pem',
    );

    const mongooseOption = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      ssl: true,
      sslValidate: false,
      sslCA: certFileBuf,
    };
    // @ts-ignore
    mongoose
      .connect(process.env.MONGO_URL || '', mongooseOption)
      .then(() => console.log('connected'))
      .catch((err) => console.log(err));
  }

  private initializeRouter() {
    this.app.use('/', RootRouter);
    this.app.use('/auth', AuthRouter);
    this.app.use('/exhibition', ExhibitionRouter);
    this.app.use('/piece', PieceRouter);
    this.app.use('/subscribe', SubscribeRouter);
    this.app.use('/like', LikeRouter);
    this.app.use('/review', ReviewRouter);
  }

  private initialErrorHandler() {
    this.app.use(errorHandler);
  }
}

export default App;
