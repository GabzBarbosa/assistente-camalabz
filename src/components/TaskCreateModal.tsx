import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Plus, X, LinkIcon, Repeat } from 'lucide-react';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TaskCreateModalProps {
  children: React.ReactNode;
  projectId?: string;
  parentTask?: {
    id: string;
    title: string;
  };
  onTaskCreated?: () => void;
}

export function TaskCreateModal({ children, projectId, parentTask, onTaskCreated }: TaskCreateModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'review' | 'done'>('todo');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState<Date>();
  const [links, setLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState('');
  
  // Recurrence fields
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date>();
  const [recurrenceDaysOfWeek, setRecurrenceDaysOfWeek] = useState<number[]>([]);
  const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState<number>(1);
  
  const { toast } = useToast();

  const addLink = () => {
    if (newLink.trim() && !links.includes(newLink.trim())) {
      setLinks([...links, newLink.trim()]);
      setNewLink('');
    }
  };

  const removeLink = (linkToRemove: string) => {
    setLinks(links.filter(link => link !== linkToRemove));
  };

  const toggleDayOfWeek = (day: number) => {
    setRecurrenceDaysOfWeek(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const calculateNextOccurrence = (startDate: Date): Date => {
    if (!isRecurring) return startDate;
    
    switch (recurrenceType) {
      case 'daily':
        return addDays(startDate, recurrenceInterval);
      case 'weekly':
        return addWeeks(startDate, recurrenceInterval);
      case 'monthly':
        return addMonths(startDate, recurrenceInterval);
      case 'yearly':
        return addYears(startDate, recurrenceInterval);
      default:
        return startDate;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        status,
        assignee: assignee.trim() || null,
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
        project_id: projectId || null,
        parent_id: parentTask?.id || null,
        links: links.length > 0 ? links : null,
        user_id: user.id,
        is_recurring: isRecurring,
        recurrence_type: isRecurring ? recurrenceType : null,
        recurrence_interval: isRecurring ? recurrenceInterval : null,
        recurrence_end_date: isRecurring && recurrenceEndDate ? format(recurrenceEndDate, 'yyyy-MM-dd') : null,
        recurrence_days_of_week: isRecurring && recurrenceType === 'weekly' && recurrenceDaysOfWeek.length > 0 ? recurrenceDaysOfWeek : null,
        recurrence_day_of_month: isRecurring && recurrenceType === 'monthly' ? recurrenceDayOfMonth : null,
        next_occurrence_date: isRecurring && dueDate ? format(calculateNextOccurrence(dueDate), 'yyyy-MM-dd') : null,
      } as any;

      const { error } = await supabase
        .from('tasks')
        .insert([taskData]);

      if (error) throw error;

      toast({
        title: "Tarefa criada",
        description: `${parentTask ? 'Subtarefa' : 'Tarefa'} "${title}" foi criada com sucesso.`,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
      setAssignee('');
      setDueDate(undefined);
      setLinks([]);
      setNewLink('');
      setIsRecurring(false);
      setRecurrenceType('daily');
      setRecurrenceInterval(1);
      setRecurrenceEndDate(undefined);
      setRecurrenceDaysOfWeek([]);
      setRecurrenceDayOfMonth(1);
      setOpen(false);
      
      onTaskCreated?.();
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {parentTask ? `Criar Subtarefa para "${parentTask.title}"` : 'Criar Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da tarefa..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a tarefa..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">A Fazer</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="review">Revisão</SelectItem>
                  <SelectItem value="done">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">Responsável</Label>
              <Input
                id="assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Nome do responsável..."
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Links</Label>
            <div className="flex gap-2">
              <Input
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="Cole um link aqui..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLink();
                  }
                }}
              />
              <Button type="button" onClick={addLink} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {links.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {links.map((link, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" />
                    <span className="max-w-[200px] truncate">{link}</span>
                    <button
                      type="button"
                      onClick={() => removeLink(link)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Recurrence Section */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="recurring" 
                checked={isRecurring} 
                onCheckedChange={(checked) => setIsRecurring(!!checked)}
              />
              <Label htmlFor="recurring" className="flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                Tarefa Recorrente
              </Label>
            </div>

            {isRecurring && (
              <div className="space-y-4 ml-6 border-l-2 border-muted pl-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Recorrência</Label>
                    <Select value={recurrenceType} onValueChange={(value: any) => setRecurrenceType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diariamente</SelectItem>
                        <SelectItem value="weekly">Semanalmente</SelectItem>
                        <SelectItem value="monthly">Mensalmente</SelectItem>
                        <SelectItem value="yearly">Anualmente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Repetir a cada</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        value={recurrenceInterval}
                        onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        {recurrenceType === 'daily' && 'dia(s)'}
                        {recurrenceType === 'weekly' && 'semana(s)'}
                        {recurrenceType === 'monthly' && 'mês(es)'}
                        {recurrenceType === 'yearly' && 'ano(s)'}
                      </span>
                    </div>
                  </div>
                </div>

                {recurrenceType === 'weekly' && (
                  <div className="space-y-2">
                    <Label>Dias da Semana</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant={recurrenceDaysOfWeek.includes(index) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleDayOfWeek(index)}
                          className="w-12 h-8"
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {recurrenceType === 'monthly' && (
                  <div className="space-y-2">
                    <Label>Dia do Mês</Label>
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      value={recurrenceDayOfMonth}
                      onChange={(e) => setRecurrenceDayOfMonth(parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Data Final da Recorrência (opcional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !recurrenceEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {recurrenceEndDate ? format(recurrenceEndDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Nunca"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={recurrenceEndDate}
                        onSelect={setRecurrenceEndDate}
                        initialFocus
                        disabled={(date) => dueDate ? date < dueDate : false}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={!title.trim() || isLoading}>
              {isLoading ? 'Criando...' : 'Criar Tarefa'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}