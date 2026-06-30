import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import oauthRouter from "./oauth";
import profilesRouter from "./profiles";
import jobsRouter from "./jobs";
import applicationsRouter from "./applications";
import cvReviewsRouter from "./cv-reviews";
import paymentsRouter from "./payments";
import statsRouter from "./stats";
import contactRouter from "./contact";
import feedbackRouter from "./feedback";
import uploadsRouter from "./uploads";
import chatRouter from "./chat";
import savedJobsRouter from "./savedJobs";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(oauthRouter);
router.use(profilesRouter);
router.use(jobsRouter);
router.use(applicationsRouter);
router.use(savedJobsRouter);
router.use(feedbackRouter);
router.use(cvReviewsRouter);
router.use(paymentsRouter);
router.use(statsRouter);
router.use(contactRouter);
router.use(uploadsRouter);
router.use(chatRouter);
router.use(adminRouter);

export default router;
