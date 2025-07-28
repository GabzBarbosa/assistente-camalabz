import { useState } from "react";
import { LayoutDashboard, Calendar, Grid3X3, BookOpen, BarChart3, GanttChart } from "lucide-react";
import heroImage from "@/assets/hero-dashboard.jpg";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import KanbanView from "@/components/views/KanbanView";
import CalendarView from "@/components/views/CalendarView";
import CSDMatrixView from "@/components/views/CSDMatrixView";
import StoriesView from "@/components/views/StoriesView";
import BenchmarkView from "@/components/views/BenchmarkView";
import TimelineView from "@/components/views/TimelineView";
const Index = () => {
  const [activeTab, setActiveTab] = useState("kanban");
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
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <div className="text-center">
              <div className="font-semibold text-primary">6</div>
              <div>Visualizações</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-primary">∞</div>
              <div>Projetos</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-card">
        <div className="px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-transparent p-0 h-auto">
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
            </div>
          </Tabs>
        </div>
      </div>
    </div>;
};
export default Index;