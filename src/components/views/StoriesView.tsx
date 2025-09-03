import { useState, useEffect } from "react";
import { Plus, BookOpen, Target, Activity, Users, GitBranch, Lightbulb, User, Tag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useSelection } from "@/hooks/use-selection";

interface Story {
  id: string;
  title: string;
  description?: string;
  acceptance_criteria?: string;
  story_points?: number;
  project_id?: string;
  status: "todo" | "in_progress" | "review" | "done";
}

const StoriesView = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { setSelection } = useSelection();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [newStory, setNewStory] = useState({
    title: "",
    description: "",
    acceptanceCriteria: "",
    storyPoints: 1,
    priority: "medium" as "low" | "medium" | "high",
    epic: "",
    persona: "",
    tags: ""
  });
  const [isCreating, setIsCreating] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string; }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchStories();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      fetchStories();
      setSelection({ projectId: selectedProject });
    }
  }, [selectedProject]);

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
      } else {
        // If no projects exist, show a message to create one first
        toast({
          title: "Nenhum projeto encontrado",
          description: "Crie um projeto primeiro antes de adicionar estórias.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar estórias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStory = async () => {
    if (!newStory.title.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O título da estória é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProject) {
      toast({
        title: "Projeto obrigatório",
        description: "Selecione um projeto antes de criar a estória.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const { data, error } = await supabase
        .from('stories')
        .insert([{
          title: newStory.title,
          description: newStory.description,
          acceptance_criteria: newStory.acceptanceCriteria,
          story_points: newStory.storyPoints,
          priority: newStory.priority,
          project_id: selectedProject || null, // Send null instead of empty string
          user_id: user?.id,
          status: "todo"
        }])
        .select()
        .single();

      if (error) throw error;

      setStories(prev => [...prev, data]);
      setNewStory({ 
        title: "", 
        description: "", 
        acceptanceCriteria: "", 
        storyPoints: 1,
        priority: "medium",
        epic: "",
        persona: "",
        tags: ""
      });
      
      toast({
        title: "✨ Estória criada com sucesso!",
        description: `"${newStory.title}" foi adicionada ao backlog.`,
      });
    } catch (error) {
      console.error('Error adding story:', error);
      toast({
        title: "Erro ao criar estória",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const generateStoryTemplate = () => {
    const templates = [
      "Como [tipo de usuário], quero [funcionalidade] para [benefício/valor]",
      "Como administrador, quero gerenciar usuários para controlar o acesso ao sistema",
      "Como cliente, quero visualizar meu histórico de pedidos para acompanhar minhas compras"
    ];
    
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    setNewStory({ ...newStory, description: randomTemplate });
  };

  const generateAcceptanceCriteria = () => {
    const criteria = [
      "• Dado que [contexto], quando [ação], então [resultado esperado]",
      "• O sistema deve validar todos os campos obrigatórios",
      "• A funcionalidade deve ser responsiva em dispositivos móveis",
      "• Deve exibir mensagens de erro claras para o usuário"
    ];
    
    setNewStory({ ...newStory, acceptanceCriteria: criteria.join("\n") });
  };

  const getStatusColor = (status: Story["status"]) => {
  switch (status) {
    case "todo": return "secondary";
    case "in_progress": return "warning";
    case "review": return "primary";
    case "done": return "success";
    default: return "secondary";
  }
  };

  const getStatusLabel = (status: Story["status"]) => {
  switch (status) {
    case "todo": return "Backlog";
    case "in_progress": return "Desenvolvimento";
    case "review": return "Revisão";
    case "done": return "Concluído";
    default: return status;
  }
  };

  const filteredStories = stories.filter(s => s.project_id === selectedProject);

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Estórias de Usuário</h2>
            <p className="text-muted-foreground">
              Organize funcionalidades por release e acompanhe o desenvolvimento
            </p>
          </div>
          
              <div className="flex items-center gap-4">
                {projects.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-foreground whitespace-nowrap">
                      Projeto:
                    </label>
                    <select 
                      value={selectedProject}
                      onChange={(e) => { setSelectedProject(e.target.value); setSelection({ projectId: e.target.value }); }}
                      className="min-w-48 px-3 py-2 border-2 border-primary/20 rounded-lg bg-background text-foreground hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                    >
                      <option value="">📁 Selecione um projeto</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          📂 {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="text-amber-600">⚠️</span>
                    <div className="text-sm text-amber-800">
                      <strong>Nenhum projeto encontrado</strong>
                      <br />
                      <span className="text-xs">Vá para a guia Kanban e crie um projeto primeiro</span>
                    </div>
                  </div>
                )}
              </div>
        </div>
      </div>

      <div className="space-y-6">{/* ... keep existing code (other sections) */}

          {/* Enhanced Story Creation */}
          <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Criar Nova Estória de Usuário
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Defina uma funcionalidade detalhada com critérios claros de aceite
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Story Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <Label htmlFor="story-title" className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4" />
                      Título da Estória *
                    </Label>
                    <Input
                      id="story-title"
                      placeholder="Ex: Cadastro de usuário no sistema"
                      value={newStory.title}
                      onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                      className={!newStory.title.trim() ? "border-destructive" : ""}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="story-description" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Descrição (User Story)
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={generateStoryTemplate}
                        className="text-xs"
                      >
                        <Lightbulb className="h-3 w-3 mr-1" />
                        Template
                      </Button>
                    </div>
                    <Textarea
                      id="story-description"
                      placeholder="Como [tipo de usuário], quero [funcionalidade] para [benefício/valor]..."
                      value={newStory.description}
                      onChange={(e) => setNewStory({ ...newStory, description: e.target.value })}
                      className="min-h-20"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="acceptance-criteria" className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Critérios de Aceite
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={generateAcceptanceCriteria}
                        className="text-xs"
                      >
                        <Lightbulb className="h-3 w-3 mr-1" />
                        Exemplo
                      </Button>
                    </div>
                    <Textarea
                      id="acceptance-criteria"
                      placeholder="• Critério 1: Dado que... quando... então...&#10;• Critério 2: O sistema deve...&#10;• Critério 3: A interface deve..."
                      value={newStory.acceptanceCriteria}
                      onChange={(e) => setNewStory({ ...newStory, acceptanceCriteria: e.target.value })}
                      className="min-h-24"
                    />
                  </div>
                </div>
                
                {/* Story Metadata */}
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <GitBranch className="h-4 w-4" />
                      Prioridade
                    </Label>
                    <Select
                      value={newStory.priority}
                      onValueChange={(value: "low" | "medium" | "high") => 
                        setNewStory({ ...newStory, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">🔴 Alta</SelectItem>
                        <SelectItem value="medium">🟡 Média</SelectItem>
                        <SelectItem value="low">🟢 Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4" />
                      Story Points
                    </Label>
                    <Select
                      value={newStory.storyPoints.toString()}
                      onValueChange={(value) => 
                        setNewStory({ ...newStory, storyPoints: Number(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 5, 8, 13, 21].map(points => (
                          <SelectItem key={points} value={points.toString()}>
                            {points} ponto{points > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="epic" className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4" />
                      Epic/Feature
                    </Label>
                    <Input
                      id="epic"
                      placeholder="Ex: Autenticação"
                      value={newStory.epic}
                      onChange={(e) => setNewStory({ ...newStory, epic: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="persona" className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4" />
                      Persona
                    </Label>
                    <Input
                      id="persona"
                      placeholder="Ex: Usuário Admin"
                      value={newStory.persona}
                      onChange={(e) => setNewStory({ ...newStory, persona: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags" className="flex items-center gap-2 mb-2">
                      <Tag className="h-4 w-4" />
                      Tags
                    </Label>
                    <Input
                      id="tags"
                      placeholder="Ex: frontend, api, critical"
                      value={newStory.tags}
                      onChange={(e) => setNewStory({ ...newStory, tags: e.target.value })}
                    />
                  </div>
                  
                  <Separator />
                  
                  <Button 
                    onClick={handleAddStory}
                    disabled={!newStory.title.trim() || isCreating}
                    className="w-full"
                    size="lg"
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Estória
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Stories List */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-foreground mb-4">
              <Users className="h-5 w-5" />
              Estórias de Usuário ({filteredStories.length})
            </h3>
            
            {filteredStories.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-foreground mb-2">
                    Nenhuma estória criada
                  </h4>
                  <p className="text-muted-foreground">
                    Adicione a primeira estória para esta release
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredStories.map((story) => (
                  <Card 
                    key={story.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => {
                      setSelection({ storyId: story.id, projectId: story.project_id || null });
                      toast({ title: "Estória selecionada", description: `\"${story.title}\" vinculada às demais guias.` });
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-2">
                          {story.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline" className={getStatusColor(story.status)}>
                            {getStatusLabel(story.status)}
                          </Badge>
                          <Badge variant="secondary">
                            {story.story_points} pts
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {story.description}
                      </p>
                      {story.acceptance_criteria && (
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">
                            Critérios de Aceite:
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {story.acceptance_criteria}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default StoriesView;