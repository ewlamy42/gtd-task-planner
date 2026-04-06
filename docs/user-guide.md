# GTD Task Planner — User Guide

## What Is This App?

The GTD Task Planner is a personal productivity tool built around David Allen's **Getting Things Done (GTD)** methodology. It gives you a single, trusted place to capture every commitment, thought, and task — then helps you organize and act on them through a clear, GTD-aligned workflow.

The visual design is inspired by Google Keep: tasks appear as cards in a masonry grid, color-coded by urgency, so you can take in your full landscape at a glance.

---

## Core GTD Concepts

GTD is built on one foundational idea: **your mind is for having ideas, not holding them.** By capturing everything into a trusted external system and organizing it into the right buckets, you free up mental bandwidth and reduce the anxiety of "what am I forgetting?"

This app maps directly to the five GTD collection buckets, plus the notion of urgency and context (environments/tags).

---

## Task Fields

Every task has the following fields:

| Field | Required | Description |
|---|---|---|
| **Title** | Yes | A short, clear description of the outcome or action. GTD recommends phrasing next actions as specific physical steps (e.g., "Call dentist to schedule checkup" rather than "Dentist"). |
| **Description** | No | Additional notes, context, or sub-steps. Good for reference material related to the task. |
| **Status** | Yes | Which GTD bucket this task lives in (see below). Defaults to **Inbox**. |
| **Urgency** | Yes | How time-sensitive this task is: **Now**, **Soon**, or **Later**. Defaults to **Now**. |
| **Environment** | No | The context or area of life this task belongs to (Work, Side Gig, Personal, or a custom one you create). |
| **Rank** | No | A numeric priority within a status bucket. Lower numbers sort first. Use this to manually order tasks within the same urgency level. Defaults to 100. |
| **Due Date** | No | An optional calendar deadline. This is informational — the app does not yet send reminders or alerts. |
| **Tags** | No | Free-form context labels, GTD-style (e.g., `@phone`, `@computer`, `@home`, `@errands`). Enter multiple tags separated by commas. Tags let you filter by the context in which you can act. |
| **Completed** | — | Whether the task is done. Completed tasks are hidden by default; toggle "Show completed tasks" in the filter panel to see them. |

---

## GTD Statuses

The **Status** field is the heart of GTD. It tells you *what kind of thing this is* and *what decision you've already made about it*.

### Inbox
**"I haven't decided what to do with this yet."**

The inbox is your capture bucket. Everything goes here first. During a weekly review (a core GTD practice), you process your inbox and move items to the appropriate bucket. The goal is to reach **Inbox Zero** — an empty inbox means every open loop has been consciously decided upon.

- Use it for: raw thoughts, ideas, items from meetings, anything that arrived and needs processing.
- Do not leave things here indefinitely — an overflowing inbox is a sign you need a review session.

### Next Action
**"This is the very next physical step I can take on this."**

A Next Action is specific and immediately actionable. GTD is precise here: it should be a single, concrete action you can start without any prior step. If you catch yourself writing a vague task like "Project X", it probably belongs in **Project** instead, with a separate Next Action capturing the first step.

- Use it for: tasks you are committed to doing as soon as possible or during this week.
- Good examples: "Draft outline for Q2 report", "Send invoice to client", "Buy birthday card at store."
- Bad examples: "Handle project X" (too vague), "Launch website" (multi-step, should be a Project).

### Project
**"This is an outcome that requires more than one step."**

In GTD, a **Project** is any desired result that requires two or more actions. Projects are not actions themselves — they are desired *outcomes*. Every project should have at least one **Next Action** associated with it (though this app doesn't enforce a formal project/next-action link — you can use the description or tags to relate them).

- Use it for: multi-step efforts like "Launch new product", "Refactor authentication system", "Plan team offsite."
- Each project should have a corresponding Next Action somewhere in your list (the immediate step that moves it forward).

### Waiting For
**"I'm blocked — I've delegated this or I'm waiting on someone/something else."**

Waiting For tracks things you've handed off or are depending on externally. GTD says you must track these explicitly, or they fall off your radar and create anxiety. A good practice is to note *who* you're waiting on in the title or description (e.g., "Waiting for Sarah to send the draft").

- Use it for: delegated tasks, pending responses, deliveries, approvals.
- Review this list regularly and follow up if items have been waiting too long.

### Someday / Maybe
**"I'm not committing to this now, but I don't want to forget it."**

Someday/Maybe is your ideas incubator. Items here are not forgotten — they are intentionally deferred. During your weekly review, you revisit this list and decide if any items are now ready to become active Next Actions or Projects.

- Use it for: books to read, places to visit, skills to learn, business ideas, things you might do when you have more time.
- This list can grow large — that's fine. The key is that you trust yourself to review it regularly.

---

## Urgency Levels

Urgency is a separate dimension from Status. It answers: *how time-critical is this right now?*

| Level | When to use |
|---|---|
| **Now** | Needs to happen today or is genuinely urgent. Shown with a red badge. |
| **Soon** | Should happen this week or in the near future. Shown with an amber badge. |
| **Later** | No pressing deadline. On the backlog for when you have capacity. Shown with a grey badge. |

Cards are sorted **urgency-first** (Now → Soon → Later), then by rank (ascending), then by creation date (newest first). This means your most pressing work always appears at the top.

---

## Environments

Environments are your areas of life or work contexts. The app seeds three defaults:

- **Work** — professional obligations, job tasks
- **Side Gig** — freelance, personal business, or entrepreneurial work
- **Personal** — life admin, health, relationships, hobbies

You can create, rename, or delete environments from the **Manage Environments** link in the sidebar. Environments are optional on tasks — leave it blank if a task doesn't belong to a specific area.

**Filtering by environment:** Click an environment in the sidebar (if linked) or use the Filters panel to narrow the task grid to one or more environments.

---

## Tags / Contexts

Tags come from the GTD concept of **contexts** — the physical location, tool, or energy level required to do a task. By tagging tasks with their context, you can quickly answer "what can I do right now given where I am and what I have available?"

Common GTD context conventions:

| Tag | Meaning |
|---|---|
| `@computer` | Requires a computer |
| `@phone` | Requires making a call |
| `@home` | Can only be done at home |
| `@errands` | Requires being out and about |
| `@office` | Requires being at the office |
| `@email` | Can be handled via email |
| `@review` | For weekly review items |

You can use any tags you like — there is no fixed list. Tags are entered comma-separated in the task edit modal, or you can filter by them in the Filters panel.

---

## Using the App

### Quick Capture Bar
The bar at the top of every screen is designed for fast capture. Type a task title, optionally set an environment, urgency, and status, then press **Add**. The goal is to remove any friction from getting things out of your head and into the system.

### Sidebar Navigation
The left sidebar shows all your GTD buckets with live task counts. Click any bucket to filter the card grid to that status only. The **Completed** bucket shows finished tasks (hidden from all other views by default).

The **Completion Rate** at the bottom of the sidebar shows what percentage of your total tasks (including completed) are done.

### Task Cards
Each card displays the task title, environment, description preview, status badge, urgency badge, and tags. You can:

- **Click the circle** on the left to mark a task complete (or undo it)
- **Click anywhere on the card** to open the full edit modal
- **Hover and click the ⋮ menu** for inline status or urgency changes without opening the full modal

### Edit Modal
Click any card to open a full edit form with all fields. Changes are saved immediately when you click **Save Changes**. You can also **delete** a task from this modal using the trash icon.

### Filters Panel
Click **Filters** to open a panel with:

- **Search** — matches against title and description
- **Urgency** — show only Now, Soon, or Later tasks (multi-select)
- **Status** — show only specific buckets (independent of the sidebar selection)
- **Environment** — filter to one or more environments
- **Tags** — add tag filters (type and press Enter); only tasks with all listed tags are shown
- **Show completed tasks** — include completed tasks in the current view

Active filter count appears as a badge on the Filters button. Use **Clear all filters** to reset.

---

## API Reference

The app exposes a REST API at `/api`. All responses are JSON.

### Environments

| Method | Path | Description |
|---|---|---|
| GET | `/api/environments` | List all environments |
| POST | `/api/environments` | Create a new environment |
| PUT | `/api/environments/:id` | Update an environment's name |
| DELETE | `/api/environments/:id` | Delete an environment |

### Tasks

| Method | Path | Description |
|---|---|---|
| GET | `/api/tasks` | List tasks (supports filters — see below) |
| POST | `/api/tasks` | Create a new task |
| GET | `/api/tasks/stats` | Get task counts by status and urgency |
| GET | `/api/tasks/:id` | Get a single task by ID |
| PUT | `/api/tasks/:id` | Update a task (partial updates supported) |
| DELETE | `/api/tasks/:id` | Delete a task |

#### `GET /api/tasks` — Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `status` | string | Comma-separated list of statuses to include (e.g., `inbox,next_action`) |
| `urgency` | string | Comma-separated list of urgency levels (e.g., `now,soon`) |
| `environmentIds` | string | Comma-separated list of environment IDs |
| `tags` | string | Comma-separated list of tags; returns tasks that have **any** of the listed tags |
| `search` | string | Searches title and description (case-insensitive) |
| `includeCompleted` | boolean | `true` to include completed tasks; default `false` |

---

## Data Storage

Tasks and environments are stored in a SQLite database at `data/tasks.db` in the project root. The file is created automatically on first run. To reset all data, stop the server and delete the file.

To use a custom database path, set the `SQLITE_DB_PATH` environment variable before starting the server.
