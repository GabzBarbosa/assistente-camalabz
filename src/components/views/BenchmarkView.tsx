import { useState } from "react";
import { Plus, Edit2, Trash2, BarChart3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface BenchmarkData {
  id: string;
  competitor: string;
  feature: string;
  score: number;
  notes: string;
  category: string;
  lastUpdated: string;
}

const BenchmarkView = () => {
  const { toast } = useToast();
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData[]>([
    {
      id: "1",
      competitor: "Trello",
      feature: "Interface do usuário",
      score: 9,
      notes: "Interface limpa e intuitiva",
      category: "UX/UI",
      lastUpdated: "2024-12-27"
    },
    {
      id: "2",
      competitor: "Trello",
      feature: "Kanban Board",
      score: 10,
      notes: "Drag & drop fluido, múltiplas colunas",
      category: "Funcionalidade",
      lastUpdated: "2024-12-27"
    },
    {
      id: "3",
      competitor: "Asana",
      feature: "Gestão de projetos",
      score: 8,
      notes: "Boa organização hierárquica",
      category: "Funcionalidade",
      lastUpdated: "2024-12-27"
    },
    {
      id: "4",
      competitor: "Asana",
      feature: "Timeline/Gantt",
      score: 9,
      notes: "Visualização clara de dependências",
      category: "Funcionalidade",
      lastUpdated: "2024-12-27"
    },
    {
      id: "5",
      competitor: "Notion",
      feature: "Flexibilidade",
      score: 10,
      notes: "Altamente customizável",
      category: "Flexibilidade",
      lastUpdated: "2024-12-27"
    },
    {
      id: "6",
      competitor: "Monday.com",
      feature: "Automações",
      score: 8,
      notes: "Boa variedade de triggers",
      category: "Automação",
      lastUpdated: "2024-12-27"
    }
  ]);

  const [newEntry, setNewEntry] = useState({
    competitor: "",
    feature: "",
    score: 5,
    notes: "",
    category: ""
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const categories = ["UX/UI", "Funcionalidade", "Performance", "Flexibilidade", "Automação", "Integrações"];
  const competitors = ["Trello", "Asana", "Notion", "Monday.com", "Jira", "ClickUp"];

  const handleAddEntry = () => {
    if (!newEntry.competitor || !newEntry.feature) return;

    const entry: BenchmarkData = {
      id: Date.now().toString(),
      ...newEntry,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setBenchmarkData([...benchmarkData, entry]);
    setNewEntry({ competitor: "", feature: "", score: 5, notes: "", category: "" });
    
    toast({
      title: "Entrada adicionada",
      description: "Nova comparação adicionada ao benchmark!",
    });
  };

  const handleDeleteEntry = (id: string) => {
    setBenchmarkData(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Entrada removida",
      description: "Comparação removida do benchmark.",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "success";
    if (score >= 6) return "warning";
    return "destructive";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 8) return "Excelente";
    if (score >= 6) return "Bom";
    if (score >= 4) return "Regular";
    return "Fraco";
  };

  const getAverageByCompetitor = () => {
    const averages: { [key: string]: number } = {};
    const counts: { [key: string]: number } = {};

    benchmarkData.forEach(item => {
      if (!averages[item.competitor]) {
        averages[item.competitor] = 0;
        counts[item.competitor] = 0;
      }
      averages[item.competitor] += item.score;
      counts[item.competitor]++;
    });

    return Object.keys(averages).map(competitor => ({
      competitor,
      average: (averages[competitor] / counts[competitor]).toFixed(1)
    })).sort((a, b) => parseFloat(b.average) - parseFloat(a.average));
  };

  const getAverageByCategory = () => {
    const averages: { [key: string]: number } = {};
    const counts: { [key: string]: number } = {};

    benchmarkData.forEach(item => {
      if (!averages[item.category]) {
        averages[item.category] = 0;
        counts[item.category] = 0;
      }
      averages[item.category] += item.score;
      counts[item.category]++;
    });

    return Object.keys(averages).map(category => ({
      category,
      average: (averages[category] / counts[category]).toFixed(1)
    }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Benchmark Competitivo</h2>
            <p className="text-muted-foreground">
              Compare funcionalidades e performance com concorrentes
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{benchmarkData.length}</div>
            <div className="text-sm text-muted-foreground">Total de comparações</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {getAverageByCompetitor()[0]?.competitor || "N/A"}
            </div>
            <div className="text-sm text-muted-foreground">Melhor concorrente</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {(benchmarkData.reduce((acc, item) => acc + item.score, 0) / benchmarkData.length).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Média geral</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {new Set(benchmarkData.map(item => item.competitor)).size}
            </div>
            <div className="text-sm text-muted-foreground">Concorrentes</div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Entry */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Comparação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <select
              value={newEntry.competitor}
              onChange={(e) => setNewEntry({ ...newEntry, competitor: e.target.value })}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">Concorrente</option>
              {competitors.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
            
            <Input
              placeholder="Funcionalidade"
              value={newEntry.feature}
              onChange={(e) => setNewEntry({ ...newEntry, feature: e.target.value })}
            />
            
            <select
              value={newEntry.category}
              onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">Categoria</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select
              value={newEntry.score}
              onChange={(e) => setNewEntry({ ...newEntry, score: Number(e.target.value) })}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                <option key={score} value={score}>{score}</option>
              ))}
            </select>
            
            <Input
              placeholder="Observações"
              value={newEntry.notes}
              onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
            />
            
            <Button 
              onClick={handleAddEntry}
              disabled={!newEntry.competitor || !newEntry.feature}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Benchmark Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Comparações Detalhadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Concorrente</TableHead>
                  <TableHead>Funcionalidade</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Pontuação</TableHead>
                  <TableHead>Avaliação</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead>Atualizado</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {benchmarkData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.competitor}</TableCell>
                    <TableCell>{item.feature}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-center font-semibold">
                        {item.score}/10
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getScoreColor(item.score)}>
                        {getScoreBadge(item.score)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={item.notes}>
                      {item.notes}
                    </TableCell>
                    <TableCell>
                      {new Date(item.lastUpdated).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(item.id)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEntry(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ranking por Concorrente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getAverageByCompetitor().map((item, index) => (
                <div key={item.competitor} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    <span>{item.competitor}</span>
                  </div>
                  <Badge variant="outline" className={getScoreColor(parseFloat(item.average))}>
                    {item.average}/10
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Média por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getAverageByCategory().map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <span>{item.category}</span>
                  <Badge variant="outline" className={getScoreColor(parseFloat(item.average))}>
                    {item.average}/10
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BenchmarkView;