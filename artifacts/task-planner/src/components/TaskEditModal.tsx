import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Task,
  useUpdateTask,
  useDeleteTask,
  useListEnvironments,
  getListTasksQueryKey,
  getGetTaskStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  environmentId: z.string().nullable().optional(),
  status: z.enum(["inbox", "next_action", "project", "waiting_for", "someday_maybe"]),
  urgency: z.enum(["now", "soon", "later"]),
  rank: z.coerce.number().int().default(0),
  dueDate: z.string().nullable().optional(),
  tags: z.string(), // We'll handle split/join in form
  completed: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskEditModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskEditModal({ task, isOpen, onClose }: TaskEditModalProps) {
  const { data: environments } = useListEnvironments();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      environmentId: null,
      status: "inbox",
      urgency: "now",
      rank: 0,
      dueDate: "",
      tags: "",
      completed: false,
    },
  });

  useEffect(() => {
    if (task && isOpen) {
      form.reset({
        title: task.title,
        description: task.description || "",
        environmentId: task.environmentId ? task.environmentId.toString() : null,
        status: task.status,
        urgency: task.urgency,
        rank: task.rank,
        dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "",
        tags: task.tags ? task.tags.join(", ") : "",
        completed: task.completed,
      });
    }
  }, [task, isOpen, form]);

  const onSubmit = (data: FormValues) => {
    if (!task) return;
    
    updateTask.mutate(
      {
        id: task.id,
        data: {
          title: data.title,
          description: data.description || null,
          environmentId: data.environmentId ? parseInt(data.environmentId) : null,
          status: data.status,
          urgency: data.urgency,
          rank: data.rank,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
          tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
          completed: data.completed,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTaskStatsQueryKey() });
          toast({ title: "Task updated" });
          onClose();
        },
      }
    );
  };

  const handleDelete = () => {
    if (!task) return;
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask.mutate(
        { id: task.id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetTaskStatsQueryKey() });
            toast({ title: "Task deleted" });
            onClose();
          },
        }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} className="resize-none min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="inbox">Inbox</SelectItem>
                        <SelectItem value="next_action">Next Action</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="waiting_for">Waiting For</SelectItem>
                        <SelectItem value="someday_maybe">Someday/Maybe</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="now">Now</SelectItem>
                        <SelectItem value="soon">Soon</SelectItem>
                        <SelectItem value="later">Later</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="environmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Environment</FormLabel>
                    <Select 
                      onValueChange={(val) => field.onChange(val === "none" ? null : val)} 
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select environment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {environments?.map((env) => (
                          <SelectItem key={env.id} value={env.id.toString()}>
                            {env.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma separated)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="work, home, errand" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rank</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="completed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Completed</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="w-full sm:w-auto mt-2 sm:mt-0"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTask.isPending} className="w-full sm:w-auto">
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
