import { useState, useEffect } from "react";
import { Plus, BookOpen, Target, Activity, Users, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

interface Story {
  id: string;
  title: string;
  description?: string;
  acceptance_criteria?: string;
  story_points?: number;
  project_id?: string;
  status: "todo" | "development" | "testing" | "done";
}

const StoriesView = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [newStory, setNewStory] = useState({
    title: "",
    description: "",
    acceptanceCriteria: "",
    storyPoints: 1
  });
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
    if (!newStory.title.trim()) return;

    try {
      const { data, error } = await supabase
        .from('stories')
        .insert([{
          title: newStory.title,
          description: newStory.description,
          acceptance_criteria: newStory.acceptanceCriteria,
          story_points: newStory.storyPoints,
          project_id: selectedProject,
          user_id: user?.id,
          status: "todo"
        }])
        .select()
        .single();

      if (error) throw error;

      setStories(prev => [...prev, data]);
      setNewStory({ title: "", description: "", acceptanceCriteria: "", storyPoints: 1 });
      
      toast({
        title: "Estória criada",
        description: "Nova estória adicionada com sucesso!",
      });
    } catch (error) {
      console.error('Error adding story:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar estória.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: Story["status"]) => {
    switch (status) {
      case "backlog": return "secondary";
      case "development": return "warning";
      case "testing": return "primary";
      case "done": return "success";
      default: return "secondary";
    }
  };

  const getStatusLabel = (status: Story["status"]) => {
    switch (status) {
      case "todo": return "Backlog";
      case "development": return "Desenvolvimento";
      case "testing": return "Testes";
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
            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6">{/* ... keep existing code (other sections) */}

          {/* Add New Story */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Adicionar Estória
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <Input
                    placeholder="Título da estória..."
                    value={newStory.title}
                    onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                    className="mb-3"
                  />
                  <Textarea
                    placeholder="Como [usuário], quero [funcionalidade] para [benefício]..."
                    value={newStory.description}
                    onChange={(e) => setNewStory({ ...newStory, description: e.target.value })}
                    className="min-h-20 mb-3"
                  />
                  <Textarea
                    placeholder="Critérios de aceite (um por linha)..."
                    value={newStory.acceptanceCriteria}
                    onChange={(e) => setNewStory({ ...newStory, acceptanceCriteria: e.target.value })}
                    className="min-h-16"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Story Points
                    </label>
                    <select
                      value={newStory.storyPoints}
                      onChange={(e) => setNewStory({ ...newStory, storyPoints: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      {[1, 2, 3, 5, 8, 13, 21].map(points => (
                        <option key={points} value={points}>{points}</option>
                      ))}
                    </select>
                  </div>
                  
                  <Button 
                    onClick={handleAddStory}
                    disabled={!newStory.title.trim()}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Estória
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
                  <Card key={story.id}>
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