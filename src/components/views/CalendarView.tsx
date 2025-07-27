import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: "task" | "meeting" | "deadline";
  priority: "low" | "medium" | "high";
}

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  
  const [events] = useState<Event[]>([
    {
      id: "1",
      title: "Reunião de planejamento",
      date: "2024-12-28",
      time: "09:00",
      type: "meeting",
      priority: "high"
    },
    {
      id: "2",
      title: "Entrega do MVP",
      date: "2024-12-30",
      type: "deadline",
      priority: "high"
    },
    {
      id: "3",
      title: "Revisão de código",
      date: "2024-12-29",
      time: "14:00",
      type: "task",
      priority: "medium"
    },
    {
      id: "4",
      title: "Sprint Review",
      date: "2025-01-03",
      time: "15:00",
      type: "meeting",
      priority: "medium"
    }
  ]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Adicionar dias do mês anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Adicionar dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }
    
    // Adicionar dias do próximo mês
    const remainingSlots = 42 - days.length;
    for (let day = 1; day <= remainingSlots; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });
    }
    
    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting": return "bg-primary/10 text-primary border-primary/20";
      case "deadline": return "bg-destructive/10 text-destructive border-destructive/20";
      case "task": return "bg-warning/10 text-warning border-warning/20";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Calendário</h2>
            <p className="text-muted-foreground">
              Visualize prazos e organize sua agenda
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Dia</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mês</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Hoje
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {viewMode === "month" && (
            <div className="grid grid-cols-7 gap-1">
              {/* Header dos dias da semana */}
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-sm font-medium text-muted-foreground border-b"
                >
                  {day}
                </div>
              ))}
              
              {/* Dias do calendário */}
              {getDaysInMonth(currentDate).map((dayInfo, index) => {
                const dayEvents = getEventsForDate(dayInfo.date);
                const isToday = dayInfo.date.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={index}
                    className={`
                      min-h-24 p-2 border border-border hover:bg-muted/50 transition-colors
                      ${!dayInfo.isCurrentMonth ? "text-muted-foreground bg-muted/30" : ""}
                      ${isToday ? "bg-primary/5 border-primary" : ""}
                    `}
                  >
                    <div className={`
                      text-sm font-medium mb-1
                      ${isToday ? "text-primary" : ""}
                    `}>
                      {dayInfo.date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`
                            text-xs p-1 rounded border text-center truncate
                            ${getEventTypeColor(event.type)}
                          `}
                          title={`${event.title} ${event.time ? `- ${event.time}` : ""}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayEvents.length - 2} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {viewMode === "week" && (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Visão Semanal</h3>
              <p className="text-muted-foreground">Em desenvolvimento</p>
            </div>
          )}
          
          {viewMode === "day" && (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Visão Diária</h3>
              <p className="text-muted-foreground">Em desenvolvimento</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;