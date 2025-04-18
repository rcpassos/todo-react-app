import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { api, TodoItem } from "@/services/api";
import { Link } from "react-router-dom";
import { BookOpen, Plus, Trash2, ArrowUp, ArrowDown, Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [newTask, setNewTask] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: () => api.dashboard.getData(),
  });

  const addTodoMutation = useMutation({
    mutationFn: (title: string) => api.dashboard.addTodo(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      toast.success("Task added", {
        description: "Your new task has been added successfully.",
      });
      setNewTask("");
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<TodoItem> }) =>
      api.dashboard.updateTodo(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      toast.success("Task updated", {
        description: "Your task has been updated successfully.",
      });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: (id: string) => api.dashboard.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      toast.success("Task deleted", {
        description: "Your task has been deleted successfully.",
      });
    },
  });

  const changePriorityMutation = useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: "up" | "down" }) =>
      api.dashboard.changePriority(id, direction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
    },
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      addTodoMutation.mutate(newTask);
    }
  };

  const toggleTaskComplete = (id: string, completed: boolean) => {
    updateTodoMutation.mutate({ id, updates: { completed: !completed } });
  };

  const deleteTask = (id: string) => {
    deleteTodoMutation.mutate(id);
  };

  const changePriority = (id: string, direction: "up" | "down") => {
    changePriorityMutation.mutate({ id, direction });
  };

  const renderPriorityStars = (priority: number) => {
    return Array(priority)
      .fill(0)
      .map((_, index) => (
        <Star key={index} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      ));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name}!
          </h1>
          <div className="space-x-4">
            <Button variant="outline" asChild>
              <Link to="/demonstration">
                <BookOpen className="mr-2 h-4 w-4" />
                Start Demonstration
              </Link>
            </Button>
            <Button variant="outline" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-[150px]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[100px]" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {data?.stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddTask} className="flex mb-6 gap-2">
                <Input
                  placeholder="Add a new task..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="flex-grow"
                />
                <Button type="submit" disabled={addTodoMutation.isPending}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </form>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-4 flex-grow" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.todos.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center text-muted-foreground"
                          >
                            No tasks yet. Add your first task above.
                          </TableCell>
                        </TableRow>
                      ) : (
                        data?.todos.map((todo) => (
                          <TableRow key={todo.id}>
                            <TableCell>
                              <Checkbox
                                checked={todo.completed}
                                onCheckedChange={() =>
                                  toggleTaskComplete(todo.id, todo.completed)
                                }
                              />
                            </TableCell>
                            <TableCell
                              className={
                                todo.completed
                                  ? "line-through text-gray-400"
                                  : ""
                              }
                            >
                              {todo.title}
                            </TableCell>
                            <TableCell>
                              <div className="flex">
                                {renderPriorityStars(todo.priority)}
                              </div>
                            </TableCell>
                            <TableCell className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => changePriority(todo.id, "up")}
                                disabled={todo.priority >= 5}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => changePriority(todo.id, "down")}
                                disabled={todo.priority <= 1}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => deleteTask(todo.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
