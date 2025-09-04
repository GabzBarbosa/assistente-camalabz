import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Edit2, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  color?: string;
  description?: string;
  project_id?: string;
}

interface EditingEvent {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  color: string;
}

interface TaskLite {
  id: string;
  title: string;
  created_at: string;
  due_date?: string | null;
  status: string;
}
const CalendarView = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [events, setEvents] = useState<Event[]>([]);
  const [taskCreations, setTaskCreations] = useState<TaskLite[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EditingEvent | null>(null);

  useEffect(() => {
    if (user) {
      fetchCalendarData();
    }
  }, [user]);

  const fetchCalendarData = async () => {
    try {
      const [eventsRes, tasksRes] = await Promise.all([
        supabase.from('events').select('*').eq('user_id', user?.id),
        supabase.from('tasks').select('id,title,created_at,due_date,status').eq('user_id', user?.id),
      ]);

      if (eventsRes.error) throw eventsRes.error;
      if (tasksRes.error) throw tasksRes.error;

      setEvents(eventsRes.data || []);
      setTaskCreations(tasksRes.data || []);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar eventos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
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
      days.push({
        date: prevDate,
        isCurrentMonth: false
      });
    }

    // Adicionar dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      });
    }

    // Adicionar dias do próximo mês
    const remainingSlots = 42 - days.length;
    for (let day = 1; day <= remainingSlots; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      });
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
  const getWeekDays = (date: Date) => {
    const dayIdx = date.getDay(); // 0-6, Domingo=0
    const start = new Date(date);
    start.setDate(date.getDate() - dayIdx);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];

    const baseEvents = events.filter(event => {
      const eventDate = new Date(event.start_date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });

    const taskEvents = taskCreations
      .filter(t => t.due_date && new Date(t.due_date).toISOString().split('T')[0] === dateStr)
      .map<Event>(t => ({
        id: `task:${t.id}`,
        title: `[Pendente] ${t.title}`,
        start_date: t.due_date as string,
        end_date: t.due_date as string,
        all_day: true,
        color: 'pending',
      }));

    return [...taskEvents, ...baseEvents];
  };

  const getEventTypeColor = (color?: string) => {
    if (color === 'pending') {
      return "bg-warning/10 text-warning border-warning/20";
    }
    return "bg-primary/10 text-primary border-primary/20";
  };
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast({
        title: "Evento excluído",
        description: "O evento foi removido do calendário."
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir evento.",
        variant: "destructive",
      });
    }
  };

  const handleEventClick = (event: Event) => {
    if (event.id.startsWith('task:')) return; // Não permite editar tarefas
    
    setEditingEvent({
      id: event.id,
      title: event.title,
      description: event.description || "",
      start_date: event.start_date,
      end_date: event.end_date,
      all_day: event.all_day,
      color: event.color || "#3b82f6"
    });
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingEvent(null);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;

    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: editingEvent.title,
          description: editingEvent.description,
          start_date: editingEvent.start_date,
          end_date: editingEvent.end_date,
          all_day: editingEvent.all_day,
          color: editingEvent.color,
        })
        .eq('id', editingEvent.id);

      if (error) throw error;

      // Atualizar o evento na lista local
      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id 
          ? { ...event, ...editingEvent }
          : event
      ));

      handleCloseModal();
      toast({
        title: "Evento atualizado",
        description: "As alterações foram salvas com sucesso!"
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar evento.",
        variant: "destructive",
      });
    }
  };

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };
  return <div className="p-6">
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
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Hoje
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {viewMode === "month" && <div className="grid grid-cols-7 gap-1">
              {/* Header dos dias da semana */}
              {weekDays.map(day => <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-b bg-violet-100">
                  {day}
                </div>)}
              
              {/* Dias do calendário */}
              {getDaysInMonth(currentDate).map((dayInfo, index) => {
            const dayEvents = getEventsForDate(dayInfo.date);
            const isToday = dayInfo.date.toDateString() === new Date().toDateString();
            return <div key={index} className={`
                      min-h-24 p-2 border border-border hover:bg-muted/50 transition-colors
                      ${!dayInfo.isCurrentMonth ? "text-muted-foreground bg-muted/30" : ""}
                      ${isToday ? "bg-primary/5 border-primary" : ""}
                    `}>
                    <div className={`
                      text-sm font-medium mb-1
                      ${isToday ? "text-primary" : ""}
                    `}>
                      {dayInfo.date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                       {dayEvents.slice(0, 2).map(event => <div 
                        key={event.id} 
                        className={`
                             text-xs p-1 rounded border text-center truncate group relative cursor-pointer
                             ${getEventTypeColor(event.color)}
                             hover:opacity-80 transition-opacity
                           `} 
                        title={event.title}
                        onClick={() => handleEventClick(event)}
                      >
                           <span className="block truncate">{event.title}</span>
                           <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                             {!event.id.startsWith('task:') && (
                               <Button
                                 size="sm"
                                 variant="ghost"
                                 onClick={e => {
                                   e.stopPropagation();
                                   handleDeleteEvent(event.id);
                                 }}
                                 className="h-4 w-4 p-0 text-destructive hover:text-destructive"
                               >
                                 <Trash2 className="h-2 w-2" />
                               </Button>
                             )}
                           </div>
                         </div>)}
                      
                      {dayEvents.length > 2 && <div className="text-xs text-muted-foreground text-center">
                          +{dayEvents.length - 2} mais
                        </div>}
                    </div>
                  </div>;
          })}
            </div>}
          
          {viewMode === "week" && <div className="grid grid-cols-7 gap-1">
              {weekDays.map(day => <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-b bg-violet-100">
                  {day}
                </div>)}
              {getWeekDays(currentDate).map((d, index) => {
            const dayEvents = getEventsForDate(d);
            const isToday = d.toDateString() === new Date().toDateString();
            return <div key={index} className={`
                      min-h-24 p-2 border border-border hover:bg-muted/50 transition-colors
                      ${isToday ? "bg-primary/5 border-primary" : ""}
                   `}>
                    <div className={`
                      text-sm font-medium mb-1
                      ${isToday ? "text-primary" : ""}
                   `}>
                      {d.getDate()}
                    </div>
                     <div className="space-y-1">
                       {dayEvents.map(event => <div 
                        key={event.id} 
                        className={`
                             text-xs p-1 rounded border text-center truncate group relative cursor-pointer
                             ${getEventTypeColor(event.color)}
                             hover:opacity-80 transition-opacity
                           `} 
                        title={event.title}
                        onClick={() => handleEventClick(event)}
                      >
                           <span className="block truncate">{event.title}</span>
                           <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                             {!event.id.startsWith('task:') && (
                               <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); handleDeleteEvent(event.id); }} className="h-4 w-4 p-0 text-destructive hover:text-destructive">
                                 <Trash2 className="h-2 w-2" />
                               </Button>
                             )}
                           </div>
                         </div>)}
                     </div>
                  </div>;
          })}
            </div>}
          
          {viewMode === "day" && <div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-medium">
                  {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>
               <div className="space-y-2">
                 {getEventsForDate(currentDate).map(event => (
                   <div 
                    key={event.id} 
                    className={`p-2 rounded border ${getEventTypeColor(event.color)} flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => handleEventClick(event)}
                   >
                     <span className="text-sm">{event.title}</span>
                     {!event.id.startsWith('task:') && (
                       <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id);
                        }} 
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                       >
                         <Trash2 className="h-3 w-3" />
                       </Button>
                     )}
                   </div>
                 ))}
                {getEventsForDate(currentDate).length === 0 && (
                  <div className="text-sm text-muted-foreground">Sem eventos</div>
                )}
              </div>
            </div>}
        </CardContent>
      </Card>
      
      {/* Modal de Edição de Evento */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5" />
              Editar Evento
            </DialogTitle>
          </DialogHeader>
          
          {editingEvent && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="event-title">Título</Label>
                <Input
                  id="event-title"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  placeholder="Digite o título do evento"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="event-description">Descrição</Label>
                <Textarea
                  id="event-description"
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  placeholder="Adicione uma descrição (opcional)"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Data/Hora de Início</Label>
                  <Input
                    id="start-date"
                    type="datetime-local"
                    value={formatDateForInput(editingEvent.start_date)}
                    onChange={(e) => setEditingEvent({ 
                      ...editingEvent, 
                      start_date: new Date(e.target.value).toISOString() 
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end-date">Data/Hora de Fim</Label>
                  <Input
                    id="end-date"
                    type="datetime-local"
                    value={formatDateForInput(editingEvent.end_date)}
                    onChange={(e) => setEditingEvent({ 
                      ...editingEvent, 
                      end_date: new Date(e.target.value).toISOString() 
                    })}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="all-day"
                    checked={editingEvent.all_day}
                    onCheckedChange={(checked) => setEditingEvent({ 
                      ...editingEvent, 
                      all_day: checked 
                    })}
                  />
                  <Label htmlFor="all-day">Evento de dia inteiro</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Label htmlFor="event-color">Cor:</Label>
                  <input
                    id="event-color"
                    type="color"
                    value={editingEvent.color}
                    onChange={(e) => setEditingEvent({ 
                      ...editingEvent, 
                      color: e.target.value 
                    })}
                    className="w-10 h-10 rounded border border-border cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={handleCloseModal}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleUpdateEvent} disabled={!editingEvent.title.trim()}>
                  <Check className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>;
};
export default CalendarView;