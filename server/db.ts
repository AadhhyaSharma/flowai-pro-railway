import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, workflows, workflowRuns, userSettings, Workflow, WorkflowRun, UserSettings } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow queries
// ─────────────────────────────────────────────────────────────────────────────

export async function getUserWorkflows(userId: number): Promise<Workflow[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(workflows)
      .where(eq(workflows.userId, userId))
      .orderBy(desc(workflows.updatedAt));
  } catch (error) {
    console.error("[Database] Failed to get user workflows:", error);
    return [];
  }
}

export async function getWorkflowById(id: number, userId: number): Promise<Workflow | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db
      .select()
      .from(workflows)
      .where(and(eq(workflows.id, id), eq(workflows.userId, userId)))
      .limit(1);

    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get workflow:", error);
    return undefined;
  }
}

export async function createWorkflow(
  userId: number,
  name: string,
  description?: string
): Promise<Workflow | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(workflows).values({
      userId,
      name,
      description,
      status: 'inactive',
      nodes: [],
      edges: [],
    });

    if (result[0].insertId) {
      const workflow = await getWorkflowById(Number(result[0].insertId), userId);
      return workflow ?? null;
    }
    return null;
  } catch (error) {
    console.error("[Database] Failed to create workflow:", error);
    return null;
  }
}

export async function updateWorkflow(
  id: number,
  userId: number,
  updates: Partial<{ name: string; description: string; status: 'active' | 'inactive'; nodes: any; edges: any }>
): Promise<Workflow | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db
      .update(workflows)
      .set(updates)
      .where(and(eq(workflows.id, id), eq(workflows.userId, userId)));

    const workflow = await getWorkflowById(id, userId);
    return workflow ?? null;
  } catch (error) {
    console.error("[Database] Failed to update workflow:", error);
    return null;
  }
}

export async function deleteWorkflow(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .delete(workflows)
      .where(and(eq(workflows.id, id), eq(workflows.userId, userId)));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete workflow:", error);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow run queries
// ─────────────────────────────────────────────────────────────────────────────

export async function getWorkflowRuns(workflowId: number, limit = 50): Promise<WorkflowRun[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(workflowRuns)
      .where(eq(workflowRuns.workflowId, workflowId))
      .orderBy(desc(workflowRuns.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get workflow runs:", error);
    return [];
  }
}

export async function createWorkflowRun(
  workflowId: number,
  trigger: string = 'manual'
): Promise<WorkflowRun | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(workflowRuns).values({
      workflowId,
      status: 'running',
      trigger,
      nodeStatuses: {},
    });

    if (result[0].insertId) {
      const run = await getWorkflowRunById(Number(result[0].insertId));
      return run ?? null;
    }
    return null;
  } catch (error) {
    console.error("[Database] Failed to create workflow run:", error);
    return null;
  }
}

export async function getWorkflowRunById(id: number): Promise<WorkflowRun | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db
      .select()
      .from(workflowRuns)
      .where(eq(workflowRuns.id, id))
      .limit(1);

    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get workflow run:", error);
    return undefined;
  }
}

export async function updateWorkflowRun(
  id: number,
  updates: Partial<{ status: 'idle' | 'running' | 'success' | 'error'; duration: number; output: any; error: string; nodeStatuses: any }>
): Promise<WorkflowRun | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db
      .update(workflowRuns)
      .set(updates)
      .where(eq(workflowRuns.id, id));

    const result = await getWorkflowRunById(id);
    return result ?? null;
  } catch (error) {
    console.error("[Database] Failed to update workflow run:", error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// User settings queries
// ─────────────────────────────────────────────────────────────────────────────

export async function getUserSettings(userId: number): Promise<UserSettings | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get user settings:", error);
    return null;
  }
}

export async function updateUserSettings(
  userId: number,
  updates: Partial<{ geminiKey: string; telegramKey: string; webhookSecret: string; preferences: any }>
): Promise<UserSettings | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Check if settings exist
    const existing = await getUserSettings(userId);

    if (existing) {
      await db
        .update(userSettings)
        .set(updates)
        .where(eq(userSettings.userId, userId));
    } else {
      await db.insert(userSettings).values({
        userId,
        ...updates,
      });
    }

    const result = await getUserSettings(userId);
    return result ?? null;
  } catch (error) {
    console.error("[Database] Failed to update user settings:", error);
    return null;
  }
}
