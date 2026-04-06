import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ListTodo,
  Inbox,
  PlayCircle,
  FolderKanban,
  Hourglass,
  CalendarDays,
  CheckCircle2,
  FolderOpen,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useGetTaskStats } from "@workspace/api-client-react";
import EnvironmentManager from "./EnvironmentManager";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  currentStatus: string | null;
  onStatusChange: (status: string | null) => void;
}

const NAV_ITEMS = [
  { id: null, label: "All Tasks", icon: ListTodo },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "next_action", label: "Next Actions", icon: PlayCircle },
  { id: "project", label: "Projects", icon: FolderKanban },
  { id: "waiting_for", label: "Waiting For", icon: Hourglass },
  { id: "someday_maybe", label: "Someday/Maybe", icon: CalendarDays },
];

export default function Sidebar({ currentStatus, onStatusChange }: SidebarProps) {
  const [isEnvManagerOpen, setIsEnvManagerOpen] = useState(false);
  const { data: stats } = useGetTaskStats();

  const getStatusCount = (statusId: string | null) => {
    if (!stats) return 0;
    if (statusId === null) {
      return stats.total - stats.completed; // Rough estimate of active tasks
    }
    const stat = stats.byStatus.find((s) => s.status === statusId);
    return stat ? stat.count : 0;
  };

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-sidebar-foreground flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-primary" />
          Focus
        </h2>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1 py-2">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.id || "all"}
              variant={currentStatus === item.id ? "secondary" : "ghost"}
              className="w-full justify-start font-medium"
              onClick={() => onStatusChange(item.id)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
              <span className="ml-auto text-xs text-muted-foreground">
                {getStatusCount(item.id)}
              </span>
            </Button>
          ))}
          <Button
            variant={currentStatus === "completed" ? "secondary" : "ghost"}
            className="w-full justify-start font-medium"
            onClick={() => onStatusChange("completed")}
          >
            <CheckCircle2 className="mr-2 h-4 w-4 text-muted-foreground" />
            Completed
            <span className="ml-auto text-xs text-muted-foreground">
              {stats?.completed || 0}
            </span>
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="py-2">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-sm font-semibold text-sidebar-foreground tracking-tight">
              Environments
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsEnvManagerOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={() => setIsEnvManagerOpen(true)}
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            Manage Environments
          </Button>
        </div>
      </ScrollArea>

      {stats && (
        <div className="p-4 mt-auto border-t border-sidebar-border bg-sidebar-accent/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Completion Rate</span>
            <span className="font-semibold text-sidebar-foreground">
              {stats.total > 0
                ? Math.round((stats.completed / stats.total) * 100)
                : 0}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full bg-sidebar-accent rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out"
              style={{
                width: `${
                  stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
                }%`,
              }}
            />
          </div>
        </div>
      )}

      <EnvironmentManager
        isOpen={isEnvManagerOpen}
        onClose={() => setIsEnvManagerOpen(false)}
      />
    </div>
  );
}
