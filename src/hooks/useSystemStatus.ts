import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';

export type SystemStatus = 'running' | 'stopped' | 'restarting';

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus>('stopped');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      setError(null);
      const response = await apiService.getSystemStatus();
      setStatus(response.status);
    } catch (err) {
      setError('Ошибка загрузки статуса системы');
      console.error('Error checking system status:', err);
    }
  }, []);

  const toggleSystem = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (status === 'running') {
        await apiService.stopSystem();
        setStatus('stopped');
      } else {
        await apiService.startSystem();
        setStatus('running');
      }
    } catch (err) {
      setError('Ошибка переключения системы');
      console.error('Error toggling system:', err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  const restartSystem = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setStatus('restarting');
      
      await apiService.restartSystem();
      
      // Проверяем статус через несколько секунд
      setTimeout(async () => {
        try {
          await checkStatus();
        } catch (err) {
          setStatus('stopped');
        } finally {
          setLoading(false);
        }
      }, 3000);
    } catch (err) {
      setError('Ошибка перезапуска системы');
      setStatus('stopped');
      setLoading(false);
      console.error('Error restarting system:', err);
    }
  }, [checkStatus]);

  useEffect(() => {
    checkStatus();
    
    // Периодическая проверка статуса
    const interval = setInterval(checkStatus, 10000);
    
    return () => clearInterval(interval);
  }, [checkStatus]);

  return {
    status,
    loading,
    error,
    toggleSystem,
    restartSystem,
    checkStatus,
  };
}