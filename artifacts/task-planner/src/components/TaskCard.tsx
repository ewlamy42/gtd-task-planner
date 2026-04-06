import React, { useState } from "react";
import { format } from "date-fns";
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  MoreVertical, 
  Folder, 
  Tag as TagIcon,
  AlertCircle
} from "lucide-react";
import { 
  Task, 
  TaskStatus, 
  TaskUrgency,
  useUpdateTask,
  getGetTaskStatsQueryKey,
  getListTasksQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TaskCardProps {
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

export default function TaskCard({ task, onEdit }: TaskCardProps) {
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
      }
    );
  };

  const handleStatusChange = (status: string) => {
    updateTask.mutate(
      { id: task.id, data: { status: status as any } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTaskStatsQueryKey() });
        },
      }
    );
  };

  const handleUrgencyChange = (urgency: string) => {
    updateTask.mutate(
      { id: task.id, data: { urgency: urgency as any } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTaskStatsQueryKey() });
        },
      }
    );
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer border-l-4",
        task.completed ? "opacity-60 border-l-muted" : 
        task.urgency === "now" ? "border-l-destructive" :
        task.urgency === "soon" ? "border-l-accent" : "border-l-primary/30"
      )}
      onClick={() => onEdit(task)}
    >
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
        <div className="flex gap-3 max-w-[90%]">
          <button
            type="button"
            onClick={handleToggleComplete}
            className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors"
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-primary" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
          <div>
            <h3 className={cn("font-medium text-base leading-tight", task.completed && "line-through text-muted-foreground")}>
              {task.title}
            </h3>
            {task.environmentName && (
              <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                <Folder className="w-3 h-3" />
                <span>{task.environmentName}</span>
              </div>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={task.status} onValueChange={handleStatusChange}>
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
                <DropdownMenuRadioGroup value={task.urgency} onValueChange={handleUrgencyChange}>
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
      </CardHeader>
      
      {task.description && (
        <CardContent className="p-4 pt-1 pb-3 text-sm text-muted-foreground line-clamp-3">
          {task.description}
        </CardContent>
      )}
      
      <CardFooter className="p-4 pt-0 flex flex-wrap items-center gap-2 mt-2">
        <Badge variant="outline" className="text-[10px] font-normal rounded-sm">
          {statusLabels[task.status]}
        </Badge>
        
        <Badge variant="outline" className={cn("text-[10px] font-medium rounded-sm uppercase tracking-wider border", urgencyColors[task.urgency])}>
          {task.urgency}
        </Badge>
        
        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {format(new Date(task.dueDate), "MMM d")}
          </div>
        )}
        
        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center gap-1 max-w-[100%] overflow-hidden">
            <TagIcon className="w-3 h-3 text-muted-foreground shrink-0" />
            <div className="flex gap-1 overflow-hidden truncate">
              {task.tags.map(tag => (
                <span key={tag} className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-sm truncate max-w-[80px]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
