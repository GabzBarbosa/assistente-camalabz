import { useState, useEffect } from "react";
import { Plus, Save, Lightbulb, HelpCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useSelection } from "@/hooks/use-selection";

interface CSDItem {
  id: string;
  content: string;
  type: "certeza" | "suposicao" | "duvida";
  project_id?: string;
  created_at: string;
}

const CSDMatrixView = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedProjectId } = useSelection();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [newItem, setNewItem] = useState({ content: "", type: "certeza" as CSDItem["type"] });
  const [csdItems, setCsdItems] = useState<CSDItem[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string; }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchCSDItems();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      fetchCSDItems();
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProjectId) {
      setSelectedProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('user_id', user?.id);

      if (error) throw error;
      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProject(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchCSDItems = async () => {
    try {
      const { data, error } = await supabase
        .from('csd_items')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setCsdItems((data || []).map((d: any) => ({ id: d.id, content: d.content, type: d.type === 'certainty' ? 'certeza' : d.type === 'supposition' ? 'suposicao' : 'duvida', project_id: d.project_id ?? undefined, created_at: d.created_at })));
    } catch (error) {
      console.error('Error fetching CSD items:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar itens CSD.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.content.trim()) return;

    try {
      const { data, error } = await supabase
        .from('csd_items')
        .insert([{
          content: newItem.content,
          type: newItem.type === 'certeza' ? 'certainty' : newItem.type === 'suposicao' ? 'supposition' : 'doubt',
          project_id: selectedProjectId || selectedProject,
          user_id: user?.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setCsdItems(prev => [...prev, { id: data.id, content: data.content, type: data.type === 'certainty' ? 'certeza' : data.type === 'supposition' ? 'suposicao' : 'duvida', project_id: data.project_id ?? undefined, created_at: data.created_at }]);
      setNewItem({ content: "", type: "certeza" });
      
      toast({
        title: "Item adicionado",
        description: "Novo item adicionado à matriz CSD!",
      });
    } catch (error) {
      console.error('Error adding CSD item:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar item.",
        variant: "destructive",
      });
    }
  };

  const getFilteredItems = (type: CSDItem["type"]) => {
    return csdItems.filter(item => 
      item.type === type && item.project_id === selectedProject
    );
  };

  const getTypeIcon = (type: CSDItem["type"]) => {
    switch (type) {
      case "certeza": return CheckCircle;
      case "suposicao": return Lightbulb;
      case "duvida": return HelpCircle;
    }
  };

  const getTypeColor = (type: CSDItem["type"]) => {
    switch (type) {
      case "certeza": return "text-success";
      case "suposicao": return "text-warning";
      case "duvida": return "text-primary";
    }
  };

  const columns = [
    { 
      type: "certeza" as const, 
      title: "Certezas", 
      subtitle: "O que sabemos que é verdade",
      bgColor: "bg-success/5 border-success/20"
    },
    { 
      type: "suposicao" as const, 
      title: "Suposições", 
      subtitle: "O que acreditamos ser verdade",
      bgColor: "bg-warning/5 border-warning/20"
    },
    { 
      type: "duvida" as const, 
      title: "Dúvidas", 
      subtitle: "O que precisamos descobrir",
      bgColor: "bg-primary/5 border-primary/20"
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Matriz CSD</h2>
            <p className="text-muted-foreground">
              Organize Certezas, Suposições e Dúvidas do projeto
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Add New Item */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Adicionar Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Textarea
                placeholder="Descreva a certeza, suposição ou dúvida..."
                value={newItem.content}
                onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                className="min-h-20"
              />
            </div>
            
            <Select 
              value={newItem.type} 
              onValueChange={(value: CSDItem["type"]) => setNewItem({ ...newItem, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="certeza">Certeza</SelectItem>
                <SelectItem value="suposicao">Suposição</SelectItem>
                <SelectItem value="duvida">Dúvida</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleAddItem}
              disabled={!newItem.content.trim()}
              className="h-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CSD Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((column) => {
          const Icon = getTypeIcon(column.type);
          const items = getFilteredItems(column.type);
          
          return (
            <Card key={column.type} className={`${column.bgColor} min-h-96`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${getTypeColor(column.type)}`}>
                  <Icon className="h-5 w-5" />
                  {column.title}
                  <span className="ml-auto text-sm font-normal">({items.length})</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{column.subtitle}</p>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon className={`h-8 w-8 mx-auto mb-2 ${getTypeColor(column.type)} opacity-50`} />
                    <p className="text-sm text-muted-foreground">
                      Nenhum item nesta categoria
                    </p>
                  </div>
                ) : (
                  items.map((item) => (
                    <Card key={item.id} className="bg-card/80 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <p className="text-sm text-foreground mb-2">{item.content}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Funcionalidade em desenvolvimento",
                                description: "Edição de itens será implementada em breve!",
                              });
                            }}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{getFilteredItems("certeza").length}</div>
            <div className="text-sm text-muted-foreground">Certezas mapeadas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{getFilteredItems("suposicao").length}</div>
            <div className="text-sm text-muted-foreground">Suposições para validar</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{getFilteredItems("duvida").length}</div>
            <div className="text-sm text-muted-foreground">Dúvidas para resolver</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CSDMatrixView;