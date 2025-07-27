import { useState } from "react";
import { Plus, BookOpen, Target, Activity, Users, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface Story {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  storyPoints: number;
  release: string;
  status: "backlog" | "development" | "testing" | "done";
}

interface Release {
  id: string;
  name: string;
  expectedResults: string[];
  activities: string[];
  stories: Story[];
}

const StoriesView = () => {
  const { toast } = useToast();
  const [selectedRelease, setSelectedRelease] = useState("release-1");
  const [newStory, setNewStory] = useState({
    title: "",
    description: "",
    acceptanceCriteria: "",
    storyPoints: 1
  });

  const [releases, setReleases] = useState<Release[]>([
    {
      id: "release-1",
      name: "Release 1.0 - MVP",
      expectedResults: [
        "Sistema de autenticação funcional",
        "CRUD básico de tarefas",
        "Interface responsiva",
        "Deploy em produção"
      ],
      activities: [
        "Setup inicial do projeto",
        "Implementação da autenticação",
        "Desenvolvimento das funcionalidades core",
        "Testes e deploy"
      ],
      stories: [
        {
          id: "story-1",
          title: "Login de usuário",
          description: "Como usuário, quero fazer login no sistema para acessar minhas tarefas",
          acceptanceCriteria: [
            "Formulário de login com email e senha",
            "Validação de credenciais",
            "Redirecionamento após login"
          ],
          storyPoints: 5,
          release: "release-1",
          status: "development"
        },
        {
          id: "story-2",
          title: "Criar tarefa",
          description: "Como usuário, quero criar uma nova tarefa para organizar meu trabalho",
          acceptanceCriteria: [
            "Formulário com título e descrição",
            "Definir prioridade e prazo",
            "Salvar tarefa no banco"
          ],
          storyPoints: 3,
          release: "release-1",
          status: "backlog"
        }
      ]
    },
    {
      id: "release-2",
      name: "Release 2.0 - Colaboração",
      expectedResults: [
        "Sistema de compartilhamento",
        "Notificações em tempo real",
        "Relatórios avançados"
      ],
      activities: [
        "Implementação de websockets",
        "Sistema de permissões",
        "Dashboard de analytics"
      ],
      stories: []
    }
  ]);

  const handleAddStory = () => {
    if (!newStory.title.trim()) return;

    const story: Story = {
      id: Date.now().toString(),
      title: newStory.title,
      description: newStory.description,
      acceptanceCriteria: newStory.acceptanceCriteria.split('\n').filter(c => c.trim()),
      storyPoints: newStory.storyPoints,
      release: selectedRelease,
      status: "backlog"
    };

    setReleases(prev => prev.map(release => 
      release.id === selectedRelease 
        ? { ...release, stories: [...release.stories, story] }
        : release
    ));

    setNewStory({ title: "", description: "", acceptanceCriteria: "", storyPoints: 1 });
    
    toast({
      title: "Estória criada",
      description: "Nova estória adicionada com sucesso!",
    });
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
      case "backlog": return "Backlog";
      case "development": return "Desenvolvimento";
      case "testing": return "Testes";
      case "done": return "Concluído";
      default: return status;
    }
  };

  const currentRelease = releases.find(r => r.id === selectedRelease);

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
              value={selectedRelease}
              onChange={(e) => setSelectedRelease(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              {releases.map((release) => (
                <option key={release.id} value={release.id}>
                  {release.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {currentRelease && (
        <div className="space-y-6">
          {/* Release Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                {currentRelease.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Expected Results */}
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-foreground mb-3">
                    <Target className="h-4 w-4" />
                    Resultados Esperados
                  </h3>
                  <ul className="space-y-2">
                    {currentRelease.expectedResults.map((result, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Activities */}
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-foreground mb-3">
                    <Activity className="h-4 w-4" />
                    Atividades
                  </h3>
                  <ul className="space-y-2">
                    {currentRelease.activities.map((activity, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-warning rounded-full mt-2 flex-shrink-0" />
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

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
              Estórias de Usuário ({currentRelease.stories.length})
            </h3>
            
            {currentRelease.stories.length === 0 ? (
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
                {currentRelease.stories.map((story) => (
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
                            {story.storyPoints} pts
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {story.description}
                      </p>
                      
                      {story.acceptanceCriteria.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">
                            Critérios de Aceite:
                          </h4>
                          <ul className="space-y-1">
                            {story.acceptanceCriteria.map((criteria, index) => (
                              <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                                <div className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                                {criteria}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoriesView;