import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import environmentsRouter from "./environments.js";
import tasksRouter from "./tasks.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(environmentsRouter);
router.use(tasksRouter);

export default router;
