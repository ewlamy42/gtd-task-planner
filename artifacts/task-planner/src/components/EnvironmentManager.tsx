import React, { useState } from "react";
import { Plus, Trash2, Edit2, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useListEnvironments,
  useCreateEnvironment,
  useUpdateEnvironment,
  useDeleteEnvironment,
  getListEnvironmentsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EnvironmentManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnvironmentManager({ isOpen, onClose }: EnvironmentManagerProps) {
  const { data: environments, isLoading } = useListEnvironments();
  const createEnv = useCreateEnvironment();
  const updateEnv = useUpdateEnvironment();
  const deleteEnv = useDeleteEnvironment();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newEnvName, setNewEnvName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvName.trim()) return;

    createEnv.mutate(
      { data: { name: newEnvName.trim() } },
      {
        onSuccess: () => {
          setNewEnvName("");
          queryClient.invalidateQueries({ queryKey: getListEnvironmentsQueryKey() });
          toast({ title: "Environment created" });
        },
      }
    );
  };

  const handleUpdate = (id: number) => {
    if (!editName.trim()) return;
    
    updateEnv.mutate(
      { id, data: { name: editName.trim() } },
      {
        onSuccess: () => {
          setEditingId(null);
          queryClient.invalidateQueries({ queryKey: getListEnvironmentsQueryKey() });
          toast({ title: "Environment updated" });
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteEnv.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListEnvironmentsQueryKey() });
          toast({ title: "Environment deleted" });
        },
        onError: (err: any) => {
          toast({
            title: "Cannot delete",
            description: "Environment might contain tasks. Move them first.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Environments</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <form onSubmit={handleCreate} className="flex items-center gap-2">
            <Input
              placeholder="New environment name..."
              value={newEnvName}
              onChange={(e) => setNewEnvName(e.target.value)}
            />
            <Button type="submit" size="icon" disabled={!newEnvName.trim() || createEnv.isPending}>
              <Plus className="h-4 w-4" />
            </Button>
          </form>

          <ScrollArea className="h-[300px] pr-4 rounded-md border border-border/50 p-2">
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground text-sm">Loading...</div>
            ) : environments?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No environments yet. Create one above.
              </div>
            ) : (
              <div className="space-y-2">
                {environments?.map((env) => (
                  <div
                    key={env.id}
                    className="flex items-center justify-between p-2 rounded-md bg-secondary/50 group"
                  >
                    {editingId === env.id ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdate(env.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
                          onClick={() => handleUpdate(env.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium text-sm">{env.name}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setEditingId(env.id);
                              setEditName(env.name);
                            }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (window.confirm("Delete this environment?")) {
                                handleDelete(env.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
