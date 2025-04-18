// Simulating API delay
const apiDelay = () => new Promise((resolve) => setTimeout(resolve, 1000));

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  priority: number;
  createdAt: string;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  highPriority: number;
}

export interface DashboardData {
  stats: {
    title: string;
    value: string;
  }[];
  chartData: {
    name: string;
    value: number;
  }[];
  todoStats: TodoStats;
  todos: TodoItem[];
}

export interface DemonstrationStep {
  id: string;
  type: "info" | "question";
  content: string;
  options?: string[]; // For multiple choice questions
}

export interface DemonstrationResponse {
  stepId: string;
  answer?: string;
}

export interface Demonstration {
  id: string;
  title: string;
  description: string;
  steps: DemonstrationStep[];
}

// Mock todos data
let todos: TodoItem[] = [
  {
    id: "1",
    title: "Complete project proposal",
    completed: false,
    priority: 3,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "2",
    title: "Review code changes",
    completed: true,
    priority: 2,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "3",
    title: "Schedule team meeting",
    completed: false,
    priority: 1,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

// Calculate todo statistics
const calculateTodoStats = (): TodoStats => {
  const completed = todos.filter((todo) => todo.completed).length;
  const highPriority = todos.filter((todo) => todo.priority >= 3).length;

  return {
    total: todos.length,
    completed,
    pending: todos.length - completed,
    highPriority,
  };
};

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      await apiDelay();
      if (email === "test@test.com" && password === "password") {
        return { id: "1", email, name: "Test User" };
      }
      throw new Error("Invalid credentials");
    },

    register: async (
      email: string,
      password: string,
      name: string
    ): Promise<User> => {
      await apiDelay();
      return { id: "1", email, name };
    },
  },

  dashboard: {
    getData: async (): Promise<DashboardData> => {
      await apiDelay();
      const todoStats = calculateTodoStats();

      return {
        stats: [
          { title: "Total Tasks", value: todoStats.total.toString() },
          { title: "Completed", value: todoStats.completed.toString() },
          { title: "Pending", value: todoStats.pending.toString() },
          { title: "High Priority", value: todoStats.highPriority.toString() },
        ],
        chartData: [
          { name: "Total", value: todoStats.total },
          { name: "Completed", value: todoStats.completed },
          { name: "Pending", value: todoStats.pending },
          { name: "High Priority", value: todoStats.highPriority },
        ],
        todoStats,
        todos,
      };
    },

    addTodo: async (title: string): Promise<TodoItem> => {
      await apiDelay();
      const newTodo: TodoItem = {
        id: Date.now().toString(),
        title,
        completed: false,
        priority: 1,
        createdAt: new Date().toISOString(),
      };
      todos = [newTodo, ...todos];
      return newTodo;
    },

    updateTodo: async (
      id: string,
      updates: Partial<TodoItem>
    ): Promise<TodoItem> => {
      await apiDelay();
      const todoIndex = todos.findIndex((todo) => todo.id === id);
      if (todoIndex === -1) throw new Error("Todo not found");

      const updatedTodo = { ...todos[todoIndex], ...updates };
      todos[todoIndex] = updatedTodo;
      return updatedTodo;
    },

    deleteTodo: async (id: string): Promise<void> => {
      await apiDelay();
      todos = todos.filter((todo) => todo.id !== id);
    },

    changePriority: async (
      id: string,
      direction: "up" | "down"
    ): Promise<TodoItem> => {
      await apiDelay();
      const todoIndex = todos.findIndex((todo) => todo.id === id);
      if (todoIndex === -1) throw new Error("Todo not found");

      const currentPriority = todos[todoIndex].priority;
      let newPriority = currentPriority;

      if (direction === "up" && currentPriority < 5) {
        newPriority = currentPriority + 1;
      } else if (direction === "down" && currentPriority > 1) {
        newPriority = currentPriority - 1;
      }

      const updatedTodo = { ...todos[todoIndex], priority: newPriority };
      todos[todoIndex] = updatedTodo;
      return updatedTodo;
    },
  },

  demonstration: {
    getData: async (): Promise<Demonstration> => {
      await apiDelay();
      return {
        id: "demo1",
        title: "Product Feature Tutorial",
        description:
          "Learn about our key features through this interactive demonstration",
        steps: [
          {
            id: "step1",
            type: "info",
            content:
              "Welcome to our product tutorial! We'll guide you through the main features.",
          },
          {
            id: "step2",
            type: "question",
            content: "What type of projects do you usually work on?",
            options: [
              "Web Development",
              "Mobile Apps",
              "Desktop Software",
              "Other",
            ],
          },
          {
            id: "step3",
            type: "info",
            content:
              "Our platform supports all kinds of projects through our flexible architecture.",
          },
          {
            id: "step4",
            type: "question",
            content: "How familiar are you with React?",
            options: ["Beginner", "Intermediate", "Advanced", "Expert"],
          },
        ],
      };
    },

    submitResponses: async (
      responses: DemonstrationResponse[]
    ): Promise<void> => {
      await apiDelay();
      console.log("Submitted responses:", responses);
    },
  },
};
