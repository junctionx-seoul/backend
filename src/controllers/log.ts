import { Request, Response, NextFunction } from 'express';
import { exhibitionModel as ExhibitionModel } from '../models/exhibition';
import { getUserInfoByToken } from '../resources/auth';
import { HttpException } from '../exceptions';
import { reviewModel } from '../models/review';
import { viewlogModel as ViewLogModel } from '../models/viewlog';

export default {
  getExhibitionsViewLogs: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = await getUserInfoByToken(String(req.token));
      if (!user)
        return next(new HttpException(401, '로그인 이후 이용해주세요.'));
      const ViewLogs = await ViewLogModel.find({ viewBy: user._id }).sort({
        createdAt: 'desc',
      });
      console.log(ViewLogs);

      const exhibitions = await Promise.all(
        ViewLogs.map(async (log) => {
          const exhibition = await ExhibitionModel.findById(log.exhibition);
          return exhibition;
        }),
      );
      const result = await Promise.all(
        exhibitions.map(async (exhibition) => {
          if (!exhibition.rating) exhibition.rating = 0;
          const reviews = await reviewModel.find({
            exhibition: exhibition._id,
          });
          let allRating = 0;
          await Promise.all(
            reviews.map((review) => {
              allRating += review.rating;
            }),
          );
          return {
            ...exhibition.toObject(),
            rating: allRating / reviews.length,
          };
        }),
      );
      res.status(200).json({ exhibitions: result });
    } catch (err) {
      next(err);
    }
  },
};
