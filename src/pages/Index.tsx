import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, Grid3X3, BookOpen, BarChart3, GanttChart, LogOut, Users } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-dashboard.jpg";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import KanbanView from "@/components/views/KanbanView";
import CalendarView from "@/components/views/CalendarView";
import CSDMatrixView from "@/components/views/CSDMatrixView";
import StoriesView from "@/components/views/StoriesView";
import BenchmarkView from "@/components/views/BenchmarkView";
import TimelineView from "@/components/views/TimelineView";
import PlanningView from "@/components/views/PlanningView";
const Index = () => {
  const [activeTab, setActiveTab] = useState("kanban");
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }
  const tabs = [{
    id: "kanban",
    label: "Kanban",
    icon: LayoutDashboard
  }, {
    id: "calendar",
    label: "Calendário",
    icon: Calendar
  }, {
    id: "csd",
    label: "Matriz CSD",
    icon: Grid3X3
  }, {
    id: "stories",
    label: "Estórias",
    icon: BookOpen
  }, {
    id: "benchmark",
    label: "Benchmark",
    icon: BarChart3
  }, {
    id: "timeline",
    label: "Timeline",
    icon: GanttChart
  }, {
    id: "planning",
    label: "Planejamento",
    icon: Users
  }];
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative border-b border-border bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={heroImage} alt="Dashboard preview" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-foreground mb-1 font-extrabold text-3xl">Camada Labz - Organizador</h1>
            <p className="text-muted-foreground font-medium">
              Plataforma completa para gestão estratégica de projetos e tarefas
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Logado como: {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <div className="text-center">
                <div className="font-semibold text-primary">7</div>
                <div>Visualizações</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-primary">∞</div>
                <div>Projetos</div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-card">
        <div className="px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7 bg-transparent p-0 h-auto">
              {tabs.map(tab => {
              const Icon = tab.icon;
              return <TabsTrigger key={tab.id} value={tab.id} className={`
                      flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200
                      data-[state=active]:tab-active data-[state=inactive]:tab-inactive
                    `}>
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>;
            })}
            </TabsList>

            {/* Tab Content */}
            <div className="mt-6">
              <TabsContent value="kanban" className="mt-0">
                <KanbanView />
              </TabsContent>
              
              <TabsContent value="calendar" className="mt-0">
                <CalendarView />
              </TabsContent>
              
              <TabsContent value="csd" className="mt-0">
                <CSDMatrixView />
              </TabsContent>
              
              <TabsContent value="stories" className="mt-0">
                <StoriesView />
              </TabsContent>
              
              <TabsContent value="benchmark" className="mt-0">
                <BenchmarkView />
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-0">
                <TimelineView />
              </TabsContent>
              
              <TabsContent value="planning" className="mt-0">
                <PlanningView />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>;
};
export default Index;