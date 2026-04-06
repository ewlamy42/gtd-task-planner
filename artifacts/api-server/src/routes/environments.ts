import { Router, type IRouter } from "express";
import {
  CreateEnvironmentBody,
  UpdateEnvironmentParams,
  UpdateEnvironmentBody,
  DeleteEnvironmentParams,
} from "@workspace/api-zod";
import {
  getEnvironments,
  createEnvironment,
  updateEnvironment,
  deleteEnvironment,
} from "../db/repository.js";

const router: IRouter = Router();

router.get("/environments", async (_req, res): Promise<void> => {
  const environments = getEnvironments();
  res.json(environments);
});

router.post("/environments", async (req, res): Promise<void> => {
  const parsed = CreateEnvironmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const env = createEnvironment(parsed.data.name);
    res.status(201).json(env);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create environment";
    res.status(400).json({ error: msg });
  }
});

router.put("/environments/:id", async (req, res): Promise<void> => {
  const params = UpdateEnvironmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateEnvironmentBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const env = updateEnvironment(params.data.id, body.data.name);
  if (!env) {
    res.status(404).json({ error: "Environment not found" });
    return;
  }

  res.json(env);
});

router.delete("/environments/:id", async (req, res): Promise<void> => {
  const params = DeleteEnvironmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const result = deleteEnvironment(params.data.id);
  if (result.hasTasks) {
    res
      .status(400)
      .json({ error: "Cannot delete environment with existing tasks. Reassign or delete tasks first." });
    return;
  }
  if (!result.deleted) {
    res.status(404).json({ error: "Environment not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
