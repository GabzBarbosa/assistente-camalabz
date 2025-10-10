import { useState, useEffect } from "react";
import { Plus, Paperclip, Calendar, User, Edit2, Trash2, X, Check, FolderPlus, CheckSquare, MoreHorizontal, Search, Filter, LinkIcon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useSelection } from "@/hooks/use-selection";
import { useProjects } from "@/hooks/use-projects";
import { TaskCreateModal } from "@/components/TaskCreateModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: string;
  due_date?: string;
  links?: string[] | null;
  parent_id?: string | null;
  project_id?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}
const KanbanView = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { setSelection } = useSelection();
  const { projects, selectedProject, setSelectedProject, getProjectById, refetch: refetchProjects } = useProjects();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [creationMode, setCreationMode] = useState<"task" | "project">("task");
  
  // Task states
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Task["priority"] | "">("");
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Project states
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectColor, setNewProjectColor] = useState("#3b82f6");
  const [newProjectEmoji, setNewProjectEmoji] = useState("📂");
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, selectedProject]);

  const fetchTasks = async () => {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id);

      if (selectedProject) {
        query = query.eq('project_id', selectedProject);
      }

      const { data, error } = await query;
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

  const refetch = () => {
    fetchTasks();
  };
  const columns = [{
    id: "todo",
    title: "A Fazer",
    color: "todo"
  }, {
    id: "in_progress",
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
    if (!selectedProject) {
      toast({
        title: "Projeto não selecionado",
        description: "Selecione um projeto para criar tarefas.",
        variant: "destructive",
      });
      return;
    }

    if (!newTaskTitle.trim() || !newTaskPriority || !newTaskDueDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Informe título, prioridade e data.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: newTaskTitle,
          description: "",
          status: columnId as Task["status"],
          priority: newTaskPriority as Task["priority"],
          due_date: newTaskDueDate,
          project_id: selectedProject,
          user_id: user?.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [...prev, data]);
      setNewTaskTitle("");
      setNewTaskPriority("");
      setNewTaskDueDate("");
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

  const handleAddProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe o nome do projeto.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: newProjectName,
          description: newProjectDescription,
          color: newProjectColor,
          emoji: newProjectEmoji,
          user_id: user?.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setSelectedProject(data.id);
      setSelection({ projectId: data.id });
      refetchProjects(); // Use the context refetch method
      setNewProjectName("");
      setNewProjectDescription("");
      setNewProjectColor("#3b82f6");
      setNewProjectEmoji("📂");
      setCreationMode("task");
      
      toast({
        title: "Projeto criado",
        description: "Novo projeto adicionado com sucesso!"
      });
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar projeto.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (projects.length <= 1) {
      toast({
        title: "Não é possível excluir",
        description: "Deve haver pelo menos um projeto.",
        variant: "destructive",
      });
      return;
    }

    try {
      // First delete all tasks associated with this project
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', projectId);

      if (tasksError) throw tasksError;

      // Then delete the project
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (projectError) throw projectError;

      // Update local state
      refetchProjects(); // Use context refetch instead
      
      // Refresh tasks
      fetchTasks();

      toast({
        title: "Projeto excluído",
        description: "Projeto e suas tarefas foram removidos com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir projeto.",
        variant: "destructive",
      });
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
    setSelection({ projectId });
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
      case "urgent":
        return "priority-badge-urgent";
      case "high":
        return "priority-badge-high";
      case "medium":
        return "priority-badge-medium";
      case "low":
        return "priority-badge-low";
      default:
        return "priority-badge-medium";
    }
  };

  const getDueDateAlert = (dueDate: string | null | undefined) => {
    if (!dueDate) return null;
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { type: 'overdue', text: `${Math.abs(diffDays)} dia(s) atrasado` };
    } else if (diffDays <= 3) {
      return { type: 'due-soon', text: `${diffDays} dia(s) restante(s)` };
    }
    
    return null;
  };
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold mb-2 text-2xl text-purple-950">Quadro Kanban</h2>
            <p className="text-muted-foreground">
              Organize suas tarefas por status e acompanhe o progresso do projeto
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Project Selector */}
            {projects.length > 0 ? (
              <div className="flex items-center gap-2">
                <Select value={selectedProject} onValueChange={handleProjectSelect}>
                  <SelectTrigger className="min-w-48">
                    <SelectValue placeholder="📁 Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.emoji || "📂"} {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProject && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteProject(selectedProject)}
                    className="h-10 w-10 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Excluir projeto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="text-amber-600">⚠️</span>
                <div className="text-sm text-amber-800">
                  <strong>Nenhum projeto encontrado</strong>
                  <br />
                  <span className="text-xs">Crie um projeto primeiro</span>
                </div>
              </div>
            )}
            
            {/* Creation Mode Toggle */}
            <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
              <TaskCreateModal projectId={selectedProject} onTaskCreated={refetch}>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Tarefa
                </Button>
              </TaskCreateModal>
              <Button
                size="sm"
                variant={creationMode === "project" ? "default" : "ghost"}
                onClick={() => setCreationMode("project")}
                className="h-8"
              >
                <FolderPlus className="h-4 w-4 mr-1" />
                Projetos
              </Button>
            </div>
          </div>
        </div>
        
        {/* Project Creation Form */}
        {creationMode === "project" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5" />
                Criar Novo Projeto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Nome do projeto..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    placeholder="Descrição (opcional)..."
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 flex-wrap">
                    {['📂', '💼', '🎯', '🚀', '📊', '🛠️', '🎨', '📱', '💡', '🏆', '📝', '🌟'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={`w-8 h-8 rounded border text-lg ${
                          newProjectEmoji === emoji ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => setNewProjectEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newProjectColor}
                    onChange={(e) => setNewProjectColor(e.target.value)}
                    className="w-10 h-10 rounded border border-border cursor-pointer"
                  />
                  <Button
                    onClick={handleAddProject}
                    disabled={!newProjectName.trim()}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Projeto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 min-h-[600px]">
        {columns.map(column => {
          const currentProject = getProjectById(selectedProject);
          return (
            <div 
              key={column.id} 
              onDrop={e => handleDrop(e, column.id)} 
              onDragOver={handleDragOver} 
              className="kanban-column"
              style={{
                backgroundColor: currentProject?.color ? `${currentProject.color}0f` : 'rgb(243 244 246)',
                borderColor: currentProject?.color || 'rgb(229 231 235)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
            <div className="flex items-center justify-between mb-4 bg-slate-50">
              <h3 className="font-semibold text-foreground">{column.title}</h3>
              <Badge variant="outline" className={`status-badge-${column.color}`}>
                {tasks.filter(task => task.status === column.id).length}
              </Badge>
            </div>

            <div className="space-y-3 mb-4">
              {tasks.filter(task => task.status === column.id).map(task => (
                <div key={task.id}>
                  {editingTask?.id === task.id ? (
                    // Editing mode
                    <div className="kanban-card border-primary">
                      <div className="space-y-3">
                        <Input 
                          value={editingTask.title} 
                          onChange={e => setEditingTask({ ...editingTask, title: e.target.value })} 
                          className="text-sm" 
                          placeholder="Título da tarefa" 
                        />
                        
                        <Textarea 
                          value={editingTask.description} 
                          onChange={e => setEditingTask({ ...editingTask, description: e.target.value })} 
                          className="text-xs" 
                          placeholder="Descrição da tarefa" 
                          rows={2} 
                        />
                        
                        <div className="flex items-center gap-2">
                          <select 
                            value={editingTask.priority} 
                            onChange={e => setEditingTask({ ...editingTask, priority: e.target.value as Task["priority"] })} 
                            className="px-2 py-1 text-xs border border-border rounded bg-background"
                          >
                            <option value="low">Baixa</option>
                            <option value="medium">Média</option>
                            <option value="high">Alta</option>
                          </select>
                          
                          <Input 
                            type="date" 
                            value={editingTask.due_date || ""} 
                            onChange={e => setEditingTask({ ...editingTask, due_date: e.target.value })} 
                            className="text-xs flex-1" 
                          />
                        </div>
                        
                        <Input 
                          value={editingTask.assignee || ""} 
                          onChange={e => setEditingTask({ ...editingTask, assignee: e.target.value })} 
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
                        {(() => {
                          const alert = getDueDateAlert(task.due_date);
                          return alert ? (
                            <Badge 
                              variant="outline" 
                              className={alert.type === 'overdue' ? 'alert-overdue' : 'alert-due-soon'}
                            >
                              {alert.text}
                            </Badge>
                          ) : null;
                        })()}
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {task.assignee && (
                        <p className="text-xs text-muted-foreground">
                          Responsável: {task.assignee}
                        </p>
                      )}
                      
                      {task.due_date && (
                        <p className="text-xs text-muted-foreground">
                          Vencimento: {format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      )}

                      {/* Links */}
                      {task.links && task.links.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.links.slice(0, 2).map((link, index) => (
                            <a
                              key={index}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded truncate max-w-[120px]"
                            >
                              <LinkIcon className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">Link</span>
                            </a>
                          ))}
                          {task.links.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{task.links.length - 2} mais
                            </span>
                          )}
                        </div>
                      )}

                      {/* Subtarefas */}
                      {(() => {
                        const subtasks = tasks?.filter(t => t.parent_id === task.id) || [];
                        if (subtasks.length > 0) {
                          const completedSubtasks = subtasks.filter(st => st.status === 'done').length;
                          return (
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <ChevronRight className="h-3 w-3" />
                              <span>{completedSubtasks}/{subtasks.length} subtarefas</span>
                              <div className="flex-1 bg-muted rounded-full h-1.5">
                                <div 
                                  className="bg-primary h-1.5 rounded-full transition-all" 
                                  style={{ width: `${(completedSubtasks / subtasks.length) * 100}%` }}
                                />
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* Indicador de subtarefa */}
                      {task.parent_id && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <ChevronRight className="h-3 w-3 rotate-90" />
                          <span>Subtarefa</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {task.due_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(task.due_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <TaskCreateModal 
                            parentTask={{ id: task.id, title: task.title }} 
                            projectId={selectedProject}
                            onTaskCreated={refetch}
                          >
                            <Button variant="ghost" size="sm" title="Criar subtarefa">
                              <Plus className="h-3 w-3" />
                            </Button>
                          </TaskCreateModal>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTask(task)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Show message when no project selected */}
            {!selectedProject && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Selecione um projeto para visualizar tarefas
              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
};
export default KanbanView;