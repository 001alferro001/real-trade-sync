import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Settings, Play, Square, RotateCcw } from "lucide-react";

interface CryptoHeaderProps {
  isRunning: boolean;
  onToggleSystem: () => void;
  onRestart: () => void;
  onSettingsClick: () => void;
  systemStatus: 'running' | 'stopped' | 'restarting';
  activePairs: number;
  activeAlerts: number;
}

export function CryptoHeader({ 
  isRunning, 
  onToggleSystem, 
  onRestart, 
  onSettingsClick,
  systemStatus,
  activePairs,
  activeAlerts
}: CryptoHeaderProps) {
  const getStatusColor = () => {
    switch (systemStatus) {
      case 'running': return 'success';
      case 'stopped': return 'destructive';
      case 'restarting': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusText = () => {
    switch (systemStatus) {
      case 'running': return 'Система активна';
      case 'stopped': return 'Система остановлена';
      case 'restarting': return 'Перезапуск...';
      default: return 'Неизвестно';
    }
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">CryptoScan Control</h1>
          </div>
          <Badge variant={getStatusColor() as any} className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
            {getStatusText()}
          </Badge>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">Торговые пары:</span>
              <Badge variant="outline">{activePairs}</Badge>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">Активные алерты:</span>
              <Badge variant="outline">{activeAlerts}</Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRestart}
              disabled={systemStatus === 'restarting'}
            >
              <RotateCcw className={`h-4 w-4 mr-2 ${systemStatus === 'restarting' ? 'animate-spin' : ''}`} />
              Перезапуск
            </Button>
            
            <Button
              variant={isRunning ? "destructive" : "success"}
              size="sm"
              onClick={onToggleSystem}
              disabled={systemStatus === 'restarting'}
            >
              {isRunning ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Остановить
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Запустить
                </>
              )}
            </Button>

            <Button variant="outline" size="sm" onClick={onSettingsClick}>
              <Settings className="h-4 w-4 mr-2" />
              Настройки
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}