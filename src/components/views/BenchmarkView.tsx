import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, BarChart3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useSelection } from "@/hooks/use-selection";

interface BenchmarkData {
  id: string;
  metric: string;
  category: string;
  current_value?: number;
  benchmark_value?: number;
  target_value?: number;
  notes?: string;
  updated_at: string;
}

const BenchmarkView = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedProjectId } = useSelection();
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData[]>([]);
  const [newEntry, setNewEntry] = useState({
    metric: "",
    category: "",
    current_value: 0,
    benchmark_value: 0,
    target_value: 0,
    notes: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const categories = ["UX/UI", "Performance", "Funcionalidade", "Usabilidade", "Segurança", "Eficiência"];

  useEffect(() => {
    if (user) {
      fetchBenchmarkData();
    }
  }, [user, selectedProjectId]);

  const fetchBenchmarkData = async () => {
    try {
      let query = supabase
        .from('benchmark_items')
        .select('*')
        .eq('user_id', user?.id);

      if (selectedProjectId) {
        query = query.eq('project_id', selectedProjectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setBenchmarkData(data || []);
    } catch (error) {
      console.error('Error fetching benchmark data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de benchmark.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.metric || !newEntry.category) return;

    try {
      const { data, error } = await supabase
        .from('benchmark_items')
        .insert([{
          ...newEntry,
          user_id: user?.id,
          project_id: selectedProjectId || null,
        }])
        .select()
        .single();

      if (error) throw error;

      setBenchmarkData(prev => [...prev, data]);
      setNewEntry({ metric: "", category: "", current_value: 0, benchmark_value: 0, target_value: 0, notes: "" });
      
      toast({
        title: "Entrada adicionada",
        description: "Nova métrica adicionada ao benchmark!",
      });
    } catch (error) {
      console.error('Error adding benchmark entry:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar entrada.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('benchmark_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBenchmarkData(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Entrada removida",
        description: "Métrica removida do benchmark.",
      });
    } catch (error) {
      console.error('Error deleting benchmark entry:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover entrada.",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return "success";
    if (percentage >= 70) return "warning";
    return "destructive";
  };

  const getScoreBadge = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return "Excelente";
    if (percentage >= 70) return "Bom";
    if (percentage >= 50) return "Regular";
    return "Fraco";
  };

  const getAverageByCategory = () => {
    const averages: { [key: string]: { current: number; target: number; count: number } } = {};

    benchmarkData.forEach(item => {
      if (!averages[item.category]) {
        averages[item.category] = { current: 0, target: 0, count: 0 };
      }
      averages[item.category].current += item.current_value || 0;
      averages[item.category].target += item.target_value || 0;
      averages[item.category].count++;
    });

    return Object.keys(averages).map(category => {
      const avg = averages[category];
      return {
        category,
        currentAverage: (avg.current / avg.count).toFixed(1),
        targetAverage: (avg.target / avg.count).toFixed(1)
      };
    });
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
              {benchmarkData.filter(item => 
                (item.current_value || 0) >= (item.target_value || 0) * 0.9
              ).length}
            </div>
            <div className="text-sm text-muted-foreground">Metas atingidas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {benchmarkData.length > 0 ? 
                ((benchmarkData.reduce((acc, item) => acc + (item.current_value || 0), 0) / 
                  benchmarkData.reduce((acc, item) => acc + (item.target_value || 1), 0)) * 100).toFixed(1) 
                : "0"}%
            </div>
            <div className="text-sm text-muted-foreground">Performance geral</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {new Set(benchmarkData.map(item => item.category)).size}
            </div>
            <div className="text-sm text-muted-foreground">Categorias</div>
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
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <Input
              placeholder="Métrica"
              value={newEntry.metric}
              onChange={(e) => setNewEntry({ ...newEntry, metric: e.target.value })}
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
            
            <Input
              type="number"
              placeholder="Valor atual"
              value={newEntry.current_value}
              onChange={(e) => setNewEntry({ ...newEntry, current_value: Number(e.target.value) })}
            />
            
            <Input
              type="number"
              placeholder="Benchmark"
              value={newEntry.benchmark_value}
              onChange={(e) => setNewEntry({ ...newEntry, benchmark_value: Number(e.target.value) })}
            />
            
            <Input
              type="number"
              placeholder="Meta"
              value={newEntry.target_value}
              onChange={(e) => setNewEntry({ ...newEntry, target_value: Number(e.target.value) })}
            />
            
            <Input
              placeholder="Observações"
              value={newEntry.notes}
              onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
            />
            
            <Button 
              onClick={handleAddEntry}
              disabled={!newEntry.metric || !newEntry.category}
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
                  <TableHead>Métrica</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor Atual</TableHead>
                  <TableHead>Benchmark</TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead>Atualizado</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {benchmarkData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.metric}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>{item.current_value}</TableCell>
                    <TableCell>{item.benchmark_value}</TableCell>
                    <TableCell>{item.target_value}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getScoreColor(item.current_value || 0, item.target_value || 1)}>
                        {getScoreBadge(item.current_value || 0, item.target_value || 1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={item.notes || ""}>
                      {item.notes}
                    </TableCell>
                    <TableCell>
                      {new Date(item.updated_at).toLocaleDateString()}
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
              <BarChart3 className="h-5 w-5" />
              Performance por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getAverageByCategory().map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <span>{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {item.currentAverage}/{item.targetAverage}
                    </span>
                    <Badge variant="outline" className={getScoreColor(parseFloat(item.currentAverage), parseFloat(item.targetAverage))}>
                      {((parseFloat(item.currentAverage) / parseFloat(item.targetAverage)) * 100).toFixed(0)}%
                    </Badge>
                  </div>
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