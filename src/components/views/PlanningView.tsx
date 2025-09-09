import { useState, useEffect } from "react";
import { Plus, Calendar, Clock, Users, Target, MessageSquare, CheckCircle2, AlertCircle, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PlanningItem {
  id: string;
  title: string;
  description?: string;
  type: "daily" | "sprint" | "refinement" | "review" | "planning";
  date: string;
  duration?: number;
  participants?: string[];
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  notes?: string;
  user_id: string;
  project_id?: string;
  created_at: string;
}

const PlanningView = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [planningItems, setPlanningItems] = useState<PlanningItem[]>([]);
  const [activeTab, setActiveTab] = useState("daily");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "daily" as PlanningItem["type"],
    date: new Date().toISOString().split("T")[0],
    duration: 30,
    participants: "",
    status: "scheduled" as PlanningItem["status"],
    notes: ""
  });

  useEffect(() => {
    if (user) {
      fetchPlanningItems();
    }
  }, [user]);

  const fetchPlanningItems = async () => {
    try {
      const { data, error } = await supabase
        .from("planning_items")
        .select("*")
        .eq("user_id", user?.id)
        .order("date", { ascending: true });

      if (error) throw error;
      setPlanningItems(data || []);
    } catch (error) {
      console.error("Erro ao carregar itens de planejamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os itens de planejamento",
        variant: "destructive",
      });
    }
  };

  const handleCreateItem = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "O título é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      const participants = formData.participants
        ? formData.participants.split(",").map(p => p.trim()).filter(p => p)
        : [];

      const { error } = await supabase
        .from("planning_items")
        .insert([{
          title: formData.title,
          description: formData.description || null,
          type: formData.type,
          date: formData.date,
          duration: formData.duration,
          participants,
          status: formData.status,
          notes: formData.notes || null,
          user_id: user?.id,
        }]);

      if (error) throw error;

      setFormData({
        title: "",
        description: "",
        type: "daily",
        date: new Date().toISOString().split("T")[0],
        duration: 30,
        participants: "",
        status: "scheduled",
        notes: ""
      });
      setIsCreateModalOpen(false);
      fetchPlanningItems();

      toast({
        title: "Sucesso",
        description: "Item de planejamento criado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao criar item:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o item",
        variant: "destructive",
      });
    }
  };

  const updateItemStatus = async (id: string, status: PlanningItem["status"]) => {
    try {
      const { error } = await supabase
        .from("planning_items")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      fetchPlanningItems();
      
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: PlanningItem["status"]) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress": return "bg-amber-100 text-amber-800 border-amber-200";
      case "completed": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: PlanningItem["type"]) => {
    switch (type) {
      case "daily": return <MessageSquare className="h-4 w-4" />;
      case "sprint": return <Target className="h-4 w-4" />;
      case "refinement": return <TrendingUp className="h-4 w-4" />;
      case "review": return <CheckCircle2 className="h-4 w-4" />;
      case "planning": return <BarChart3 className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: PlanningItem["type"]) => {
    switch (type) {
      case "daily": return "Daily Standup";
      case "sprint": return "Sprint Planning";
      case "refinement": return "Refinement";
      case "review": return "Sprint Review";
      case "planning": return "Planning";
      default: return type;
    }
  };

  const filterItemsByType = (type: PlanningItem["type"]) => {
    return planningItems.filter(item => item.type === type);
  };

  const tabs = [
    { id: "daily", label: "Daily", icon: MessageSquare },
    { id: "sprint", label: "Sprint", icon: Target },
    { id: "refinement", label: "Refinement", icon: TrendingUp },
    { id: "review", label: "Review", icon: CheckCircle2 },
    { id: "planning", label: "Planning", icon: BarChart3 }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Planejamento Ágil</h2>
          <p className="text-muted-foreground">Gerencie suas cerimônias e planejamentos</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Cerimônia
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nova Cerimônia</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Tipo</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as PlanningItem["type"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Standup</SelectItem>
                    <SelectItem value="sprint">Sprint Planning</SelectItem>
                    <SelectItem value="refinement">Refinement</SelectItem>
                    <SelectItem value="review">Sprint Review</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Daily Standup - Sprint 23"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detalhes da cerimônia..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Data</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Duração (min)</label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                    min="15"
                    step="15"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Participantes</label>
                <Input
                  value={formData.participants}
                  onChange={(e) => setFormData(prev => ({ ...prev, participants: e.target.value }))}
                  placeholder="Nome1, Nome2, Nome3..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Notas</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações, agenda, objetivos..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateItem}>
                  Criar Cerimônia
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            <div className="grid gap-4">
              {filterItemsByType(tab.id as PlanningItem["type"]).length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <tab.icon className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground text-center">
                      Nenhuma cerimônia de {getTypeLabel(tab.id as PlanningItem["type"]).toLowerCase()} encontrada
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filterItemsByType(tab.id as PlanningItem["type"]).map(item => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(item.type)}
                          <div>
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(item.date), "dd/MM/yyyy", { locale: ptBR })}
                              {item.duration && ` • ${item.duration} min`}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(item.status)} variant="outline">
                          {item.status === "scheduled" && "Agendado"}
                          {item.status === "in_progress" && "Em andamento"}
                          {item.status === "completed" && "Concluído"}
                          {item.status === "cancelled" && "Cancelado"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {item.description && (
                        <p className="text-muted-foreground mb-3">{item.description}</p>
                      )}
                      
                      {item.participants && item.participants.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Participantes:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.participants.map((participant, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {participant}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.notes && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Notas:</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.notes}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {item.status === "scheduled" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateItemStatus(item.id, "in_progress")}
                            >
                              Iniciar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateItemStatus(item.id, "cancelled")}
                            >
                              Cancelar
                            </Button>
                          </>
                        )}
                        {item.status === "in_progress" && (
                          <Button
                            size="sm"
                            onClick={() => updateItemStatus(item.id, "completed")}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Concluir
                          </Button>
                        )}
                        {item.status === "completed" && (
                          <Badge variant="outline" className="bg-emerald-50">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Concluído
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PlanningView;