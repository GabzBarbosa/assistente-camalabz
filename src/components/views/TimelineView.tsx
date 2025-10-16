import { useState, useEffect } from "react";
import { Calendar, Clock, Plus, Users, GanttChart, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

interface TimelineTask {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  progress?: number;
  milestone: boolean;
  project_id?: string;
  project?: {
    id: string;
    name: string;
    emoji?: string;
  };
}

const TimelineView = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedView, setSelectedView] = useState<"month" | "quarter" | "year">("month");
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchTimelineItems();
    }
  }, [user]);

  const fetchTimelineItems = async () => {
    try {
      const [timelineRes, tasksRes, projectsRes] = await Promise.all([
        supabase
          .from('timeline_items')
          .select('*, project:projects(id, name, emoji)')
          .eq('user_id', user?.id),
        supabase
          .from('tasks')
          .select('id,title,created_at,due_date,status,project_id,project:projects(id,name,emoji)')
          .eq('user_id', user?.id)
          .not('due_date', 'is', null),
        supabase
          .from('projects')
          .select('*')
          .eq('user_id', user?.id),
      ]);

      if (timelineRes.error) throw timelineRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (projectsRes.error) throw projectsRes.error;

      setProjects(projectsRes.data || []);

      const timelineData = (timelineRes.data || []).map((item: any) => ({
        ...item,
        project_id: item.project_id,
        project: item.project,
      })) as (TimelineTask & { project_id?: string; project?: any })[];

      // Mapear tarefas com datas para o cronograma
      const taskItems: (TimelineTask & { project_id?: string; project?: any })[] = (tasksRes.data || []).map((t: any) => {
        const progress = t.status === 'done' ? 100 : t.status === 'in_progress' ? 50 : 0;
        return {
          id: `task:${t.id}`,
          title: t.title,
          start_date: t.created_at,
          end_date: t.due_date,
          progress,
          milestone: false,
          project_id: t.project_id,
          project: t.project,
        };
      });

      setTasks([...taskItems, ...timelineData]);
    } catch (error) {
      console.error('Error fetching timeline items:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar itens da timeline.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Gerar datas para o cabeçalho da timeline baseado na visualização
  const generateTimelineDates = () => {
    const today = new Date();
    const dates: Date[] = [];

    if (selectedView === "month") {
      // Mês atual: mostrar todos os dias
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const current = new Date(startDate);
      while (current <= endDate) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    } else if (selectedView === "quarter") {
      // Trimestre: mostrar semanas (13 semanas)
      const currentQuarter = Math.floor(today.getMonth() / 3);
      const startDate = new Date(today.getFullYear(), currentQuarter * 3, 1);
      
      for (let week = 0; week < 13; week++) {
        const weekDate = new Date(startDate);
        weekDate.setDate(startDate.getDate() + (week * 7));
        dates.push(weekDate);
      }
    } else if (selectedView === "year") {
      // Ano: mostrar meses (12 meses)
      for (let month = 0; month < 12; month++) {
        dates.push(new Date(today.getFullYear(), month, 1));
      }
    }

    return dates;
  };

  const timelineDates = generateTimelineDates();

  // Calcular posição da tarefa na timeline
  const getTaskPosition = (task: TimelineTask) => {
    const timelineStart = timelineDates[0];
    const timelineEnd = timelineDates[timelineDates.length - 1];
    const taskStart = new Date(task.start_date);
    const taskEnd = task.end_date ? new Date(task.end_date) : new Date(task.start_date);
    
    let totalTimeMs: number;
    
    if (selectedView === "month") {
      // Calcular em dias
      totalTimeMs = timelineEnd.getTime() - timelineStart.getTime();
    } else if (selectedView === "quarter") {
      // Calcular em semanas (13 semanas)
      totalTimeMs = 13 * 7 * 24 * 60 * 60 * 1000;
    } else {
      // Calcular em meses (12 meses)
      totalTimeMs = 365 * 24 * 60 * 60 * 1000;
    }
    
    const taskStartOffset = taskStart.getTime() - timelineStart.getTime();
    const taskDuration = taskEnd.getTime() - taskStart.getTime();
    
    const leftPercent = Math.max(0, Math.min(100, (taskStartOffset / totalTimeMs) * 100));
    const widthPercent = Math.max(1, Math.min(100 - leftPercent, (taskDuration / totalTimeMs) * 100));
    
    return { left: `${leftPercent}%`, width: `${widthPercent}%` };
  };

  const getStatusColor = (progress: number) => {
    if (progress >= 100) return "bg-success";
    if (progress >= 50) return "bg-primary";
    if (progress >= 25) return "bg-warning";
    return "bg-muted";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('timeline_items')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast({
        title: "Item excluído",
        description: "O item foi removido da timeline.",
      });
    } catch (error) {
      console.error('Error deleting timeline item:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir item.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Timeline do Projeto</h2>
            <p className="text-muted-foreground">
              Visualize cronograma e dependências entre tarefas
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value as any)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="month">Mensal</option>
              <option value="quarter">Trimestral</option>
              <option value="year">Anual</option>
            </select>
            
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GanttChart className="h-5 w-5" />
            Cronograma Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Date Headers */}
              <div className="flex mb-4">
                <div className="w-48 flex-shrink-0"></div>
                <div className="flex-1 relative">
                  <div className="flex">
                    {timelineDates.map((date, index) => {
                      let label1, label2;
                      
                      if (selectedView === "month") {
                        label1 = date.getDate().toString();
                        label2 = date.toLocaleDateString('pt-BR', { weekday: 'short' });
                      } else if (selectedView === "quarter") {
                        label1 = `S${index + 1}`;
                        label2 = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
                      } else {
                        label1 = date.toLocaleDateString('pt-BR', { month: 'short' });
                        label2 = '';
                      }
                      
                      return (
                        <div
                          key={index}
                          className={`
                            flex-1 text-center text-xs py-2 border-r border-border
                            ${selectedView === "month" 
                              ? `min-w-8 ${isWeekend(date) ? 'bg-muted/30' : 'bg-background'}` 
                              : selectedView === "quarter" 
                              ? 'min-w-16 bg-background'
                              : 'min-w-20 bg-background'
                            }
                          `}
                        >
                          <div className="font-medium">
                            {label1}
                          </div>
                          {label2 && (
                            <div className="text-muted-foreground">
                              {label2}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-2">
                {tasks.map((task) => {
                  const position = getTaskPosition(task);
                  
                  return (
                    <div key={task.id} className="flex items-center border-b border-border/50 pb-2 group">
                      {/* Task Info */}
                      <div className="w-48 flex-shrink-0 pr-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium truncate flex-1">
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            {task.milestone && (
                              <Badge variant="outline">
                                Milestone
                              </Badge>
                            )}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2">
                              {!task.id.startsWith('task:') && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {task.description && (
                          <div className="text-xs text-muted-foreground mb-1">
                            {task.description}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(task.start_date)} {task.end_date && `- ${formatDate(task.end_date)}`}</span>
                        </div>
                      </div>

                      {/* Timeline Bar */}
                      <div className="flex-1 relative h-8">
                        <div className="absolute inset-0 bg-muted/20 rounded"></div>
                        
                        <div
                          className={`
                            absolute top-1 bottom-1 rounded-sm flex items-center px-2 text-xs font-medium text-white
                            ${getStatusColor(task.progress || 0)}
                          `}
                          style={position}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate">{task.progress || 0}%</span>
                            <Clock className="h-3 w-3 ml-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Progresso por Tarefa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium truncate flex-1 mr-2">
                    {task.title}
                  </span>
                  <Badge variant="outline">
                    {task.milestone ? "Milestone" : "Tarefa"}
                  </Badge>
                </div>
                <Progress value={task.progress || 0} className="h-2" />
                <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                  <span>{task.description || "Sem descrição"}</span>
                  <span>{task.progress || 0}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estatísticas do Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Total de tarefas</span>
                <span className="font-semibold">{tasks.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Concluídas</span>
                <span className="font-semibold text-success">
                  {tasks.filter(t => (t.progress || 0) >= 100).length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Em andamento</span>
                <span className="font-semibold text-primary">
                  {tasks.filter(t => (t.progress || 0) > 0 && (t.progress || 0) < 100).length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Não iniciadas</span>
                <span className="font-semibold text-muted-foreground">
                  {tasks.filter(t => (t.progress || 0) === 0).length}
                </span>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span>Progresso geral</span>
                  <span className="font-semibold">
                    {tasks.length > 0 ? Math.round(tasks.reduce((acc, task) => acc + (task.progress || 0), 0) / tasks.length) : 0}%
                  </span>
                </div>
                <Progress 
                  value={tasks.length > 0 ? tasks.reduce((acc, task) => acc + (task.progress || 0), 0) / tasks.length : 0} 
                  className="mt-2"
                />
              </div>

              {projects.length > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-3">Conclusão por Projeto</h4>
                  <div className="space-y-3">
                    {projects.map((project) => {
                      const projectTasks = tasks.filter(t => t.project_id === project.id);
                      const progress = projectTasks.length > 0
                        ? Math.round(projectTasks.reduce((acc, task) => acc + (task.progress || 0), 0) / projectTasks.length)
                        : 0;
                      
                      return (
                        <div key={project.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm truncate flex-1">
                              {project.emoji || '📂'} {project.name}
                            </span>
                            <span className="text-sm font-medium ml-2">
                              {progress}%
                            </span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimelineView;