import { useState, useEffect } from "react";
import { Plus, Paperclip, Calendar, User, Edit2, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  assignee?: string;
  due_date?: string;
}
const KanbanView = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar tarefas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const columns = [{
    id: "todo",
    title: "A Fazer",
    color: "todo"
  }, {
    id: "progress",
    title: "Em Progresso",
    color: "progress"
  }, {
    id: "review",
    title: "Revisão",
    color: "review"
  }, {
    id: "done",
    title: "Concluído",
    color: "done"
  }];
  const handleAddTask = async (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: newTaskTitle,
          description: "",
          status: columnId as Task["status"],
          priority: "medium",
          user_id: user?.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [...prev, data]);
      setNewTaskTitle("");
      toast({
        title: "Tarefa criada",
        description: "Nova tarefa adicionada com sucesso!"
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar tarefa.",
        variant: "destructive",
      });
    }
  };
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };
  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus as Task["status"] })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task => task.id === taskId ? {
        ...task,
        status: newStatus as Task["status"]
      } : task));
      
      toast({
        title: "Tarefa movida",
        description: "Status atualizado com sucesso!"
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar tarefa.",
        variant: "destructive",
      });
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleEditTask = (task: Task) => {
    setEditingTask({
      ...task
    });
  };
  const handleSaveEdit = async () => {
    if (!editingTask) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: editingTask.title,
          description: editingTask.description,
          priority: editingTask.priority,
          assignee: editingTask.assignee,
          due_date: editingTask.due_date,
        })
        .eq('id', editingTask.id);

      if (error) throw error;

      setTasks(tasks.map(task => task.id === editingTask.id ? editingTask : task));
      setEditingTask(null);
      toast({
        title: "Tarefa atualizada",
        description: "As alterações foram salvas com sucesso!"
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar tarefa.",
        variant: "destructive",
      });
    }
  };
  const handleCancelEdit = () => {
    setEditingTask(null);
  };
  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.filter(task => task.id !== taskId));
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi removida com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir tarefa.",
        variant: "destructive",
      });
    }
  };
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };
  return <div className="p-6">
      <div className="mb-6">
        <h2 className="font-semibold mb-2 text-2xl text-purple-950 text-center">Quadro Kanban</h2>
        <p className="text-muted-foreground text-center">
          Organize suas tarefas por status e acompanhe o progresso do projeto
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 min-h-[600px]">
        {columns.map(column => <div key={column.id} onDrop={e => handleDrop(e, column.id)} onDragOver={handleDragOver} className="kanban-column bg-purple-50">
            <div className="flex items-center justify-between mb-4 bg-slate-50">
              <h3 className="font-semibold text-foreground">{column.title}</h3>
              <Badge variant="outline" className={`status-badge-${column.color}`}>
                {tasks.filter(task => task.status === column.id).length}
              </Badge>
            </div>

            <div className="space-y-3 mb-4">
              {tasks.filter(task => task.status === column.id).map(task => <div key={task.id}>
                    {editingTask?.id === task.id ?
            // Editing mode
            <div className="kanban-card border-primary">
                        <div className="space-y-3">
                          <Input value={editingTask.title} onChange={e => setEditingTask({
                  ...editingTask,
                  title: e.target.value
                })} className="text-sm" placeholder="Título da tarefa" />
                          
                          <Textarea value={editingTask.description} onChange={e => setEditingTask({
                  ...editingTask,
                  description: e.target.value
                })} className="text-xs" placeholder="Descrição da tarefa" rows={2} />
                          
                          <div className="flex items-center gap-2">
                            <select value={editingTask.priority} onChange={e => setEditingTask({
                    ...editingTask,
                    priority: e.target.value as Task["priority"]
                  })} className="px-2 py-1 text-xs border border-border rounded bg-background">
                              <option value="low">Baixa</option>
                              <option value="medium">Média</option>
                              <option value="high">Alta</option>
                            </select>
                            
                            <Input type="date" value={editingTask.due_date || ""} onChange={e => setEditingTask({
                    ...editingTask,
                    due_date: e.target.value
                  })} className="text-xs flex-1" />
                          </div>
                          
                          <Input value={editingTask.assignee || ""} onChange={e => setEditingTask({
                  ...editingTask,
                  assignee: e.target.value
                })} className="text-xs" placeholder="Responsável" />
                          
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
                      </div> :
            // View mode
            <div className="kanban-card group" draggable onDragStart={e => handleDragStart(e, task.id)}>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm text-foreground line-clamp-2 flex-1">
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="ghost" onClick={() => handleEditTask(task)} className="h-6 w-6 p-0">
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteTask(task.id)} className="h-6 w-6 p-0 text-destructive hover:text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        
                        {task.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {task.description}
                          </p>}
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-3">
                            {task.assignee && <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{task.assignee}</span>
                              </div>}
                            
                          </div>
                          
                          {task.due_date && <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(task.due_date).toLocaleDateString()}</span>
                            </div>}
                        </div>
                      </div>}
                  </div>)}
            </div>

            {/* Add Task */}
            <div className="space-y-2">
              <Input placeholder="Nova tarefa..." value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} onKeyPress={e => e.key === "Enter" && handleAddTask(column.id)} className="text-sm" />
              <Button onClick={() => handleAddTask(column.id)} variant="outline" size="sm" className="w-full" disabled={!newTaskTitle.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>)}
      </div>
    </div>;
};
export default KanbanView;