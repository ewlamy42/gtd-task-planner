import React from "react";
import { format } from "date-fns";
import {
  CheckCircle2,
  Circle,
  Calendar,
  MoreVertical,
  Folder,
  Tag as TagIcon,
} from "lucide-react";
import {
  Task,
  TaskStatus,
  TaskUrgency,
  UpdateTaskBody,
  useUpdateTask,
  getGetTaskStatsQueryKey,
  getListTasksQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TaskListItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const statusLabels: Record<string, string> = {
  inbox: "Inbox",
  next_action: "Next Action",
  project: "Project",
  waiting_for: "Waiting",
  someday_maybe: "Someday",
};

const urgencyColors: Record<string, string> = {
  now: "bg-destructive/10 text-destructive border-destructive/20",
  soon: "bg-accent/20 text-accent-foreground border-accent/30",
  later: "bg-muted text-muted-foreground border-transparent",
};

const urgencyDot: Record<string, string> = {
  now: "bg-destructive",
  soon: "bg-accent",
  later: "bg-primary/30",
};

export default function TaskListItem({ task, onEdit }: TaskListItemProps) {
  const queryClient = useQueryClient();
  const updateTask = useUpdateTask();

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateTask.mutate(
      { id: task.id, data: { completed: !task.completed } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTaskStatsQueryKey() });
        },
      },
    );
  };

  const handleStatusChange = (status: string) => {
    updateTask.mutate(
      { id: task.id, data: { status: status as UpdateTaskBody["status"] } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTaskStatsQueryKey() });
        },
      },
    );
  };

  const handleUrgencyChange = (urgency: string) => {
    updateTask.mutate(
      { id: task.id, data: { urgency: urgency as UpdateTaskBody["urgency"] } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTaskStatsQueryKey() });
        },
      },
    );
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-4 py-3 rounded-lg border bg-card cursor-pointer transition-all duration-200 hover:shadow-sm hover:bg-muted/30",
        task.completed && "opacity-60",
      )}
      onClick={() => onEdit(task)}
    >
      {/* Urgency dot */}
      <span
        className={cn(
          "shrink-0 w-2 h-2 rounded-full",
          task.completed ? "bg-muted" : urgencyDot[task.urgency],
        )}
      />

      {/* Completion checkbox */}
      <button
        type="button"
        onClick={handleToggleComplete}
        className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
      >
        {task.completed ? (
          <CheckCircle2 className="w-5 h-5 text-primary" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>

      {/* Title + environment */}
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <span
          className={cn(
            "text-sm font-medium truncate",
            task.completed && "line-through text-muted-foreground",
          )}
        >
          {task.title}
        </span>
        {task.environmentName && (
          <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Folder className="w-3 h-3" />
            {task.environmentName}
          </span>
        )}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="hidden md:flex items-center gap-1 shrink-0">
          <TagIcon className="w-3 h-3 text-muted-foreground" />
          {task.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-sm truncate max-w-[60px]"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="text-[10px] text-muted-foreground">
              +{task.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Due date */}
      {task.dueDate && (
        <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Calendar className="w-3 h-3" />
          {format(new Date(task.dueDate), "MMM d")}
        </div>
      )}

      {/* Status badge */}
      <Badge
        variant="outline"
        className="hidden sm:inline-flex text-[10px] font-normal rounded-sm shrink-0"
      >
        {statusLabels[task.status]}
      </Badge>

      {/* Urgency badge */}
      <Badge
        variant="outline"
        className={cn(
          "text-[10px] font-medium rounded-sm uppercase tracking-wider border shrink-0",
          urgencyColors[task.urgency],
        )}
      >
        {task.urgency}
      </Badge>

      {/* Action menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={task.status}
                onValueChange={handleStatusChange}
              >
                {Object.entries(TaskStatus).map(([key, val]) => (
                  <DropdownMenuRadioItem key={key} value={val}>
                    {statusLabels[key]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Change Urgency</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={task.urgency}
                onValueChange={handleUrgencyChange}
              >
                {Object.entries(TaskUrgency).map(([key, val]) => (
                  <DropdownMenuRadioItem key={key} value={val}>
                    <span className="capitalize">{key}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
