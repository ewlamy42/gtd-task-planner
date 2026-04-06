import React, { useState } from "react";
import { Plus, Folder, AlertCircle } from "lucide-react";
import { useCreateTask, useListEnvironments, getListTasksQueryKey, getGetTaskStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function QuickAddBar() {
  const [title, setTitle] = useState("");
  const [urgency, setUrgency] = useState<"now" | "soon" | "later">("now");
  const [environmentId, setEnvironmentId] = useState<string>("none");
  const [status, setStatus] = useState<"inbox" | "next_action" | "project" | "waiting_for" | "someday_maybe">("inbox");
  
  const { data: environments } = useListEnvironments();
  const createTask = useCreateTask();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTask.mutate(
      {
        data: {
          title: title.trim(),
          urgency,
          status,
          environmentId: environmentId !== "none" ? parseInt(environmentId) : null,
        }
      },
      {
        onSuccess: () => {
          setTitle("");
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTaskStatsQueryKey() });
          toast({
            title: "Task added",
            description: "Your task has been captured.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to add task.",
            variant: "destructive",
          });
        }
      }
    );
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-card rounded-lg shadow-sm border border-border"
    >
      <div className="relative flex-1 w-full">
        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Capture a thought or task..."
          className="pl-10 border-0 bg-transparent shadow-none focus-visible:ring-0 text-base"
        />
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 px-2 sm:px-0">
        <Select value={environmentId} onValueChange={setEnvironmentId}>
          <SelectTrigger className="w-[130px] h-8 text-xs border-dashed shrink-0">
            <div className="flex items-center gap-2">
              <Folder className="w-3 h-3" />
              <SelectValue placeholder="Environment" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Env</SelectItem>
            {environments?.map(env => (
              <SelectItem key={env.id} value={env.id.toString()}>{env.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={urgency} onValueChange={(val: any) => setUrgency(val)}>
          <SelectTrigger className="w-[100px] h-8 text-xs border-dashed shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              <SelectValue placeholder="Urgency" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="now">Now</SelectItem>
            <SelectItem value="soon">Soon</SelectItem>
            <SelectItem value="later">Later</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={status} onValueChange={(val: any) => setStatus(val)}>
          <SelectTrigger className="w-[110px] h-8 text-xs border-dashed shrink-0">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inbox">Inbox</SelectItem>
            <SelectItem value="next_action">Next Action</SelectItem>
            <SelectItem value="project">Project</SelectItem>
            <SelectItem value="waiting_for">Waiting For</SelectItem>
            <SelectItem value="someday_maybe">Someday</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          type="submit" 
          size="sm" 
          className="h-8 shrink-0 rounded-md"
          disabled={!title.trim() || createTask.isPending}
        >
          Add
        </Button>
      </div>
    </form>
  );
}
