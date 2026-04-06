import { Router, type IRouter } from "express";
import {
  ListTasksQueryParams,
  CreateTaskBody,
  GetTaskParams,
  UpdateTaskParams,
  UpdateTaskBody,
  DeleteTaskParams,
} from "@workspace/api-zod";
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} from "../db/repository.js";

const router: IRouter = Router();

router.get("/tasks/stats", async (_req, res): Promise<void> => {
  const stats = getTaskStats();
  res.json(stats);
});

router.get("/tasks", async (req, res): Promise<void> => {
  const parsed = ListTasksQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const tasks = getTasks({
    environmentIds: parsed.data.environmentIds,
    status: parsed.data.status,
    urgency: parsed.data.urgency,
    search: parsed.data.search,
    tags: parsed.data.tags,
    includeCompleted: parsed.data.includeCompleted,
  });

  res.json(tasks);
});

router.post("/tasks", async (req, res): Promise<void> => {
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const task = createTask({
    title: parsed.data.title,
    description: parsed.data.description,
    environmentId: parsed.data.environmentId,
    urgency: parsed.data.urgency,
    rank: parsed.data.rank,
    status: parsed.data.status,
    dueDate: parsed.data.dueDate,
    tags: parsed.data.tags,
    completed: parsed.data.completed,
  });

  res.status(201).json(task);
});

router.get("/tasks/:id", async (req, res): Promise<void> => {
  const params = GetTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const task = getTask(params.data.id);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.json(task);
});

router.put("/tasks/:id", async (req, res): Promise<void> => {
  const params = UpdateTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateTaskBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const task = updateTask(params.data.id, {
    title: body.data.title,
    description: body.data.description,
    environmentId: body.data.environmentId,
    urgency: body.data.urgency,
    rank: body.data.rank,
    status: body.data.status,
    dueDate: body.data.dueDate,
    tags: body.data.tags,
    completed: body.data.completed,
  });

  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.json(task);
});

router.delete("/tasks/:id", async (req, res): Promise<void> => {
  const params = DeleteTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const deleted = deleteTask(params.data.id);
  if (!deleted) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
