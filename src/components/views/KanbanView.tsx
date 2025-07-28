import { useState } from "react";
import { Plus, Paperclip, Calendar, User, Edit2, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

  const handleEditTask = (task: Task) => {
    setEditingTask({ ...task });
  };

  const handleSaveEdit = () => {
    if (!editingTask) return;
    
    setTasks(tasks.map(task => 
      task.id === editingTask.id ? editingTask : task
    ));
    setEditingTask(null);
    
    toast({
      title: "Tarefa atualizada",
      description: "As alterações foram salvas com sucesso!",
    });
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast({
      title: "Tarefa excluída",
      description: "A tarefa foi removida com sucesso!",
    });
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
                  <div key={task.id}>
                    {editingTask?.id === task.id ? (
                      // Editing mode
                      <div className="kanban-card border-primary">
                        <div className="space-y-3">
                          <Input
                            value={editingTask.title}
                            onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                            className="text-sm"
                            placeholder="Título da tarefa"
                          />
                          
                          <Textarea
                            value={editingTask.description}
                            onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                            className="text-xs"
                            placeholder="Descrição da tarefa"
                            rows={2}
                          />
                          
                          <div className="flex items-center gap-2">
                            <select
                              value={editingTask.priority}
                              onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Task["priority"] })}
                              className="px-2 py-1 text-xs border border-border rounded bg-background"
                            >
                              <option value="low">Baixa</option>
                              <option value="medium">Média</option>
                              <option value="high">Alta</option>
                            </select>
                            
                            <Input
                              type="date"
                              value={editingTask.dueDate || ""}
                              onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                              className="text-xs flex-1"
                            />
                          </div>
                          
                          <Input
                            value={editingTask.assignee || ""}
                            onChange={(e) => setEditingTask({ ...editingTask, assignee: e.target.value })}
                            className="text-xs"
                            placeholder="Responsável"
                          />
                          
                          <div className="flex items-center gap-2">
                            <Button size="sm" onClick={handleSaveEdit} className="flex-1">
                              <Check className="h-3 w-3 mr-1" />
                              Salvar
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              <X className="h-3 w-3 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div
                        className="kanban-card group"
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm text-foreground line-clamp-2 flex-1">
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditTask(task)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteTask(task.id)}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
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
                    )}
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