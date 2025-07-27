import { useState } from "react";
import { Calendar, Clock, Plus, Users, GanttChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TimelineTask {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  assignee: string;
  dependencies: string[];
  priority: "low" | "medium" | "high";
  status: "not-started" | "in-progress" | "completed" | "delayed";
}

const TimelineView = () => {
  const [selectedView, setSelectedView] = useState<"month" | "quarter" | "year">("month");
  
  const [tasks] = useState<TimelineTask[]>([
    {
      id: "task-1",
      name: "Planejamento inicial",
      startDate: "2024-12-23",
      endDate: "2024-12-27",
      progress: 100,
      assignee: "João Silva",
      dependencies: [],
      priority: "high",
      status: "completed"
    },
    {
      id: "task-2",
      name: "Design da interface",
      startDate: "2024-12-28",
      endDate: "2025-01-05",
      progress: 60,
      assignee: "Maria Santos",
      dependencies: ["task-1"],
      priority: "high",
      status: "in-progress"
    },
    {
      id: "task-3",
      name: "Desenvolvimento backend",
      startDate: "2025-01-02",
      endDate: "2025-01-15",
      progress: 20,
      assignee: "Pedro Costa",
      dependencies: ["task-1"],
      priority: "high",
      status: "in-progress"
    },
    {
      id: "task-4",
      name: "Desenvolvimento frontend",
      startDate: "2025-01-06",
      endDate: "2025-01-20",
      progress: 0,
      assignee: "Ana Oliveira",
      dependencies: ["task-2"],
      priority: "medium",
      status: "not-started"
    },
    {
      id: "task-5",
      name: "Testes de integração",
      startDate: "2025-01-16",
      endDate: "2025-01-25",
      progress: 0,
      assignee: "Carlos Lima",
      dependencies: ["task-3", "task-4"],
      priority: "high",
      status: "not-started"
    },
    {
      id: "task-6",
      name: "Deploy em produção",
      startDate: "2025-01-26",
      endDate: "2025-01-30",
      progress: 0,
      assignee: "João Silva",
      dependencies: ["task-5"],
      priority: "high",
      status: "not-started"
    }
  ]);

  // Gerar datas para o cabeçalho da timeline
  const generateTimelineDates = () => {
    const startDate = new Date("2024-12-23");
    const endDate = new Date("2025-01-30");
    const dates = [];
    
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const timelineDates = generateTimelineDates();

  // Calcular posição da tarefa na timeline
  const getTaskPosition = (task: TimelineTask) => {
    const startDate = new Date("2024-12-23");
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    
    const totalDays = timelineDates.length;
    const taskStartDay = Math.floor((taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const taskDuration = Math.floor((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const leftPercent = (taskStartDay / totalDays) * 100;
    const widthPercent = (taskDuration / totalDays) * 100;
    
    return { left: `${leftPercent}%`, width: `${widthPercent}%` };
  };

  const getStatusColor = (status: TimelineTask["status"]) => {
    switch (status) {
      case "completed": return "bg-success";
      case "in-progress": return "bg-primary";
      case "delayed": return "bg-destructive";
      case "not-started": return "bg-muted";
      default: return "bg-muted";
    }
  };

  const getPriorityColor = (priority: TimelineTask["priority"]) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "warning";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  const getStatusLabel = (status: TimelineTask["status"]) => {
    switch (status) {
      case "completed": return "Concluído";
      case "in-progress": return "Em andamento";
      case "delayed": return "Atrasado";
      case "not-started": return "Não iniciado";
      default: return status;
    }
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
                    {timelineDates.map((date, index) => (
                      <div
                        key={index}
                        className={`
                          flex-1 min-w-8 text-center text-xs py-2 border-r border-border
                          ${isWeekend(date) ? 'bg-muted/30' : 'bg-background'}
                        `}
                      >
                        <div className="font-medium">
                          {date.getDate()}
                        </div>
                        <div className="text-muted-foreground">
                          {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-2">
                {tasks.map((task) => {
                  const position = getTaskPosition(task);
                  
                  return (
                    <div key={task.id} className="flex items-center border-b border-border/50 pb-2">
                      {/* Task Info */}
                      <div className="w-48 flex-shrink-0 pr-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium truncate flex-1">
                            {task.name}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`ml-2 ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <Users className="h-3 w-3" />
                          <span>{task.assignee}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(task.startDate)} - {formatDate(task.endDate)}</span>
                        </div>
                      </div>

                      {/* Timeline Bar */}
                      <div className="flex-1 relative h-8">
                        <div className="absolute inset-0 bg-muted/20 rounded"></div>
                        
                        <div
                          className={`
                            absolute top-1 bottom-1 rounded-sm flex items-center px-2 text-xs font-medium text-white
                            ${getStatusColor(task.status)}
                          `}
                          style={position}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate">{task.progress}%</span>
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
                    {task.name}
                  </span>
                  <Badge variant="outline" className={getStatusColor(task.status).replace('bg-', 'text-')}>
                    {getStatusLabel(task.status)}
                  </Badge>
                </div>
                <Progress value={task.progress} className="h-2" />
                <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                  <span>{task.assignee}</span>
                  <span>{task.progress}%</span>
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
                  {tasks.filter(t => t.status === "completed").length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Em andamento</span>
                <span className="font-semibold text-primary">
                  {tasks.filter(t => t.status === "in-progress").length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Não iniciadas</span>
                <span className="font-semibold text-muted-foreground">
                  {tasks.filter(t => t.status === "not-started").length}
                </span>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span>Progresso geral</span>
                  <span className="font-semibold">
                    {Math.round(tasks.reduce((acc, task) => acc + task.progress, 0) / tasks.length)}%
                  </span>
                </div>
                <Progress 
                  value={tasks.reduce((acc, task) => acc + task.progress, 0) / tasks.length} 
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimelineView;