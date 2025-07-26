import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { useConfig } from "@/hooks/useConfig";
import { apiService } from "@/services/api";
import { CryptoHeader } from "@/components/CryptoHeader";
import { ConfigManager } from "@/components/ConfigManager";
import { WatchlistManager } from "@/components/WatchlistManager";
import { AlertsDisplay } from "@/components/AlertsDisplay";
import { 
  Settings, 
  Eye, 
  AlertTriangle, 
  BarChart3,
  Activity
} from "lucide-react";

const Index = () => {
  const [activePairs, setActivePairs] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();
  const { status: systemStatus, toggleSystem, restartSystem, loading } = useSystemStatus();
  const { saveConfig } = useConfig();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [pairsData, alertsData] = await Promise.all([
        apiService.getWatchlistCount(),
        apiService.getAlertsCount()
      ]);

      setActivePairs(pairsData.count);
      setActiveAlerts(alertsData.count);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  const handleToggleSystem = async () => {
    try {
      await toggleSystem();
      toast({
        title: systemStatus === 'stopped' ? "Система запущена" : "Система остановлена",
        description: systemStatus === 'stopped' ? 
          "Мониторинг активирован" : 
          "Мониторинг деактивирован",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить состояние системы",
        variant: "destructive",
      });
    }
  };

  const handleRestart = async () => {
    try {
      await restartSystem();
      toast({
        title: "Система перезапущена",
        description: "Все компоненты успешно перезагружены",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось перезапустить систему",
        variant: "destructive",
      });
    }
  };

  const handleSaveConfig = async (config: any) => {
    const success = await saveConfig(config);
    if (!success) {
      throw new Error('Ошибка сохранения конфигурации');
    }
  };

  const handleConfigRestart = async () => {
    await handleRestart();
  };

  const handleWatchlistUpdate = () => {
    loadStats();
  };

  if (showSettings) {
    return (
      <div className="min-h-screen bg-background">
      <CryptoHeader 
        isRunning={systemStatus === 'running'}
        onToggleSystem={handleToggleSystem}
        onRestart={handleRestart}
        onSettingsClick={() => setShowSettings(false)}
        systemStatus={systemStatus}
        activePairs={activePairs}
        activeAlerts={activeAlerts}
      />
        <ConfigManager 
          onSave={handleSaveConfig}
          onRestart={handleConfigRestart}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CryptoHeader 
        isRunning={systemStatus === 'running'}
        onToggleSystem={handleToggleSystem}
        onRestart={handleRestart}
        onSettingsClick={() => setShowSettings(true)}
        systemStatus={systemStatus}
        activePairs={activePairs}
        activeAlerts={activeAlerts}
      />
      
      <main className="container mx-auto p-6">
        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Алерты
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Список отслеживания
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Аналитика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-6">
            <AlertsDisplay />
          </TabsContent>

          <TabsContent value="watchlist" className="space-y-6">
            <WatchlistManager onUpdate={handleWatchlistUpdate} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <Activity className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Аналитика в разработке</h3>
              <p className="text-muted-foreground">
                Здесь будут отображаться графики и статистика по обнаруженным манипуляциям
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;