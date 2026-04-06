import React, { useState, useMemo } from "react";
import { useListTasks, Task } from "@workspace/api-client-react";
import Sidebar from "@/components/Sidebar";
import QuickAddBar from "@/components/QuickAddBar";
import TaskCard from "@/components/TaskCard";
import FiltersPanel from "@/components/FiltersPanel";
import TaskEditModal from "@/components/TaskEditModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Inbox, CheckCircle2, ListTodo, FolderKanban, PlayCircle, Hourglass, CalendarDays, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  
  // Filters state
  const [search, setSearch] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<string[]>([]);
  const [environmentFilter, setEnvironmentFilter] = useState<string[]>([]);
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [includeCompleted, setIncludeCompleted] = useState(false);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const queryParams = useMemo(() => {
    const params: any = {};
    if (currentStatus === "completed") {
      params.includeCompleted = true;
      // We don't filter by status for the completed view to show ALL completed tasks
      // unless we want to, but GTD usually just has a "completed" view.
    } else if (currentStatus) {
      params.status = currentStatus;
    }
    
    if (search) params.search = search;
    if (urgencyFilter.length > 0) params.urgency = urgencyFilter.join(",");
    if (environmentFilter.length > 0) params.environmentIds = environmentFilter.join(",");
    if (tagsFilter.length > 0) params.tags = tagsFilter.join(",");
    
    // If not in completed view, respect the toggle
    if (currentStatus !== "completed") {
      params.includeCompleted = includeCompleted;
    }

    return params;
  }, [currentStatus, search, urgencyFilter, environmentFilter, tagsFilter, includeCompleted]);

  const { data: tasks, isLoading } = useListTasks(queryParams);

  // Sorting: urgency (Now > Soon > Later), then rank (ascending), then createdAt (descending)
  const sortedTasks = useMemo(() => {
    if (!tasks) return [];
    
    let filteredTasks = [...tasks];
    if (currentStatus === "completed") {
      filteredTasks = filteredTasks.filter(t => t.completed);
    }
    
    return filteredTasks.sort((a, b) => {
      const urgencyWeight: Record<string, number> = { now: 3, soon: 2, later: 1 };
      
      if (urgencyWeight[a.urgency] !== urgencyWeight[b.urgency]) {
        return urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
      }
      
      if (a.rank !== b.rank) {
        return a.rank - b.rank; // Ascending rank
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newer first
    });
  }, [tasks, currentStatus]);

  const getEmptyStateContent = () => {
    switch (currentStatus) {
      case "inbox":
        return {
          icon: Inbox,
          title: "Inbox Zero!",
          desc: "Your mind is clear. Add new thoughts up top when they arrive."
        };
      case "next_action":
        return {
          icon: PlayCircle,
          title: "No next actions",
          desc: "What's the very next physical step you can take to move a project forward?"
        };
      case "project":
        return {
          icon: FolderKanban,
          title: "No active projects",
          desc: "Any outcome requiring more than one step is a project."
        };
      case "waiting_for":
        return {
          icon: Hourglass,
          title: "Nothing blocking you",
          desc: "You aren't waiting on anything from anyone right now."
        };
      case "someday_maybe":
        return {
          icon: CalendarDays,
          title: "No future dreams recorded",
          desc: "Capture things you might want to do someday, but not right now."
        };
      case "completed":
        return {
          icon: CheckCircle2,
          title: "Nothing completed yet",
          desc: "Your finished tasks will appear here. Get to work!"
        };
      default:
        return {
          icon: ListTodo,
          title: "Clear horizon",
          desc: "No tasks match your current filters. Take a deep breath."
        };
    }
  };

  const emptyState = getEmptyStateContent();

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background">
      <Sidebar 
        currentStatus={currentStatus} 
        onStatusChange={(status) => {
          setCurrentStatus(status);
          if (status === "completed") {
            setIncludeCompleted(true);
          }
        }} 
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="shrink-0 p-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 space-y-4">
          <div className="max-w-5xl mx-auto w-full">
            <QuickAddBar />
            <div className="mt-4">
              <FiltersPanel 
                search={search} setSearch={setSearch}
                urgencyFilter={urgencyFilter} setUrgencyFilter={setUrgencyFilter}
                environmentFilter={environmentFilter} setEnvironmentFilter={setEnvironmentFilter}
                tagsFilter={tagsFilter} setTagsFilter={setTagsFilter}
                includeCompleted={includeCompleted} setIncludeCompleted={setIncludeCompleted}
              />
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 w-full bg-muted/20">
          <div className="p-6 max-w-5xl mx-auto w-full min-h-full">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                <p>Loading your focus space...</p>
              </div>
            ) : sortedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center max-w-sm mx-auto animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <emptyState.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground tracking-tight mb-2">{emptyState.title}</h3>
                <p className="text-muted-foreground text-sm">{emptyState.desc}</p>
                {Object.keys(queryParams).length > (currentStatus ? 1 : 0) && (
                  <Button 
                    variant="link" 
                    className="mt-4 text-primary"
                    onClick={() => {
                      setSearch("");
                      setUrgencyFilter([]);
                      setEnvironmentFilter([]);
                      setTagsFilter([]);
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4 pb-12">
                {sortedTasks.map((task, i) => (
                  <div 
                    key={task.id} 
                    className="break-inside-avoid animate-in slide-in-from-bottom-4 fade-in duration-500 fill-mode-backwards"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <TaskCard 
                      task={task} 
                      onEdit={setEditingTask} 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      <TaskEditModal 
        task={editingTask} 
        isOpen={!!editingTask} 
        onClose={() => setEditingTask(null)} 
      />
    </div>
  );
}
