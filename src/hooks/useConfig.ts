import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';

export type ConfigData = Record<string, string>;

export function useConfig() {
  const [config, setConfig] = useState<ConfigData>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getConfig();
      setConfig(data);
      setHasChanges(false);
    } catch (err) {
      setError('Ошибка загрузки конфигурации');
      console.error('Error loading config:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback((key: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  }, []);

  const saveConfig = useCallback(async (configToSave: ConfigData = config) => {
    try {
      setSaving(true);
      setError(null);
      await apiService.updateConfig(configToSave);
      setConfig(configToSave);
      setHasChanges(false);
      return true;
    } catch (err) {
      setError('Ошибка сохранения конфигурации');
      console.error('Error saving config:', err);
      return false;
    } finally {
      setSaving(false);
    }
  }, [config]);

  const resetChanges = useCallback(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loading,
    saving,
    error,
    hasChanges,
    updateConfig,
    saveConfig,
    resetChanges,
    loadConfig,
  };
}