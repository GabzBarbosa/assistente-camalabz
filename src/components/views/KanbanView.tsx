import { useState } from "react";
import { Plus, Paperclip, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  assignee?: string;
  dueDate?: string;
  attachments?: number;
}

const KanbanView = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Implementar sistema de autenticação",
      description: "Criar login com email e senha",
      status: "todo",
      priority: "high",
      assignee: "João Silva",
      dueDate: "2024-12-30",
      attachments: 2
    },
    {
      id: "2",
      title: "Revisar documentação da API",
      description: "Atualizar endpoints e exemplos",
      status: "progress",
      priority: "medium",
      assignee: "Maria Santos",
      attachments: 1
    },
    {
      id: "3",
      title: "Testes de integração",
      description: "Validar fluxos críticos",
      status: "review",
      priority: "high",
      assignee: "Pedro Costa"
    },
    {
      id: "4",
      title: "Deploy em produção",
      description: "Publicar versão 2.0",
      status: "done",
      priority: "low",
      assignee: "Ana Oliveira"
    }
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState("");

  const columns = [
    { id: "todo", title: "A Fazer", color: "todo" },
    { id: "progress", title: "Em Progresso", color: "progress" },
    { id: "review", title: "Revisão", color: "review" },
    { id: "done", title: "Concluído", color: "done" }
  ];

  const handleAddTask = (columnId: string) => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: "",
      status: columnId as Task["status"],
      priority: "medium"
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    toast({
      title: "Tarefa criada",
      description: "Nova tarefa adicionada com sucesso!",
    });
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus as Task["status"] }
        : task
    ));
    
    toast({
      title: "Tarefa movida",
      description: "Status atualizado com sucesso!",
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "warning";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Quadro Kanban</h2>
        <p className="text-muted-foreground">
          Organize suas tarefas por status e acompanhe o progresso do projeto
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 min-h-[600px]">
        {columns.map((column) => (
          <div
            key={column.id}
            className="kanban-column"
            onDrop={(e) => handleDrop(e, column.id)}
            onDragOver={handleDragOver}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{column.title}</h3>
              <Badge variant="outline" className={`status-badge-${column.color}`}>
                {tasks.filter(task => task.status === column.id).length}
              </Badge>
            </div>

            <div className="space-y-3 mb-4">
              {tasks
                .filter(task => task.status === column.id)
                .map((task) => (
                  <div
                    key={task.id}
                    className="kanban-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm text-foreground line-clamp-2">
                        {task.title}
                      </h4>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        {task.assignee && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{task.assignee}</span>
                          </div>
                        )}
                        
                        {task.attachments && task.attachments > 0 && (
                          <div className="flex items-center gap-1">
                            <Paperclip className="h-3 w-3" />
                            <span>{task.attachments}</span>
                          </div>
                        )}
                      </div>
                      
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Add Task */}
            <div className="space-y-2">
              <Input
                placeholder="Nova tarefa..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTask(column.id)}
                className="text-sm"
              />
              <Button
                onClick={() => handleAddTask(column.id)}
                variant="outline"
                size="sm"
                className="w-full"
                disabled={!newTaskTitle.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanView;