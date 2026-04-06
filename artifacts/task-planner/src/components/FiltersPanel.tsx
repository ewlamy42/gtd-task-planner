import React from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useListEnvironments } from "@workspace/api-client-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FiltersPanelProps {
  search: string;
  setSearch: (s: string) => void;
  urgencyFilter: string[];
  setUrgencyFilter: (u: string[]) => void;
  environmentFilter: string[];
  setEnvironmentFilter: (e: string[]) => void;
  tagsFilter: string[];
  setTagsFilter: (t: string[]) => void;
  includeCompleted: boolean;
  setIncludeCompleted: (c: boolean) => void;
}

export default function FiltersPanel({
  search,
  setSearch,
  urgencyFilter,
  setUrgencyFilter,
  environmentFilter,
  setEnvironmentFilter,
  tagsFilter,
  setTagsFilter,
  includeCompleted,
  setIncludeCompleted,
}: FiltersPanelProps) {
  const { data: environments } = useListEnvironments();
  const [tagInput, setTagInput] = React.useState("");

  const toggleUrgency = (u: string) => {
    if (urgencyFilter.includes(u)) {
      setUrgencyFilter(urgencyFilter.filter((item) => item !== u));
    } else {
      setUrgencyFilter([...urgencyFilter, u]);
    }
  };

  const toggleEnvironment = (e: string) => {
    if (environmentFilter.includes(e)) {
      setEnvironmentFilter(environmentFilter.filter((item) => item !== e));
    } else {
      setEnvironmentFilter([...environmentFilter, e]);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tagsFilter.includes(newTag)) {
        setTagsFilter([...tagsFilter, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (t: string) => {
    setTagsFilter(tagsFilter.filter((item) => item !== t));
  };

  const activeFiltersCount =
    (search ? 1 : 0) +
    urgencyFilter.length +
    environmentFilter.length +
    tagsFilter.length +
    (includeCompleted ? 1 : 0);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 py-2 w-full">
      <div className="relative w-full sm:w-64 shrink-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          className="pl-9 h-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground"
            onClick={() => setSearch("")}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 shrink-0">
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 font-normal">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm leading-none">Urgency</h4>
              <div className="flex flex-wrap gap-2">
                {["now", "soon", "later"].map((u) => (
                  <Badge
                    key={u}
                    variant={urgencyFilter.includes(u) ? "default" : "outline"}
                    className="cursor-pointer uppercase text-[10px] tracking-wider"
                    onClick={() => toggleUrgency(u)}
                  >
                    {u}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm leading-none">Environment</h4>
              <ScrollArea className="h-[100px] w-full border rounded-md p-2">
                <div className="flex flex-col gap-1">
                  {environments?.map((env) => (
                    <Label
                      key={env.id}
                      className="flex items-center gap-2 font-normal text-sm cursor-pointer p-1 hover:bg-muted/50 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={environmentFilter.includes(env.id.toString())}
                        onChange={() => toggleEnvironment(env.id.toString())}
                        className="rounded border-input text-primary focus:ring-primary"
                      />
                      {env.name}
                    </Label>
                  ))}
                  {environments?.length === 0 && (
                    <span className="text-muted-foreground text-xs p-1">
                      No environments found.
                    </span>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm leading-none">Tags</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                {tagsFilter.map((t) => (
                  <Badge key={t} variant="secondary" className="flex items-center gap-1">
                    {t}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => removeTag(t)}
                    />
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Press Enter to add tag..."
                className="h-8 text-xs"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
              />
            </div>

            <div className="flex items-center justify-between space-x-2 pt-2 border-t">
              <Label htmlFor="completed" className="text-sm font-medium">
                Show completed tasks
              </Label>
              <Switch
                id="completed"
                checked={includeCompleted}
                onCheckedChange={setIncludeCompleted}
              />
            </div>
            
            {activeFiltersCount > 0 && (
              <div className="pt-2 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-muted-foreground text-xs"
                  onClick={() => {
                    setSearch("");
                    setUrgencyFilter([]);
                    setEnvironmentFilter([]);
                    setTagsFilter([]);
                    setIncludeCompleted(false);
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
