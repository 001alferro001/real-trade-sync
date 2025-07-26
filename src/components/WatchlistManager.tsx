import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  TrendingDown,
  DollarSign,
  Calendar
} from "lucide-react";

interface WatchlistItem {
  id: number;
  symbol: string;
  price_drop: number;
  current_price: number;
  historical_price: number;
  is_active: boolean;
  added_at: string;
  updated_at: string;
}

interface WatchlistManagerProps {
  onUpdate: () => void;
}

export function WatchlistManager({ onUpdate }: WatchlistManagerProps) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState({
    symbol: '',
    price_drop: '',
    current_price: '',
    historical_price: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      const data = await fetch('http://localhost:8000/api/watchlist').then(res => res.json()).catch(() => [
        // Пример данных для разработки
        {
          id: 1,
          symbol: "BTCUSDT",
          price_drop: 15.5,
          current_price: 45000.50,
          historical_price: 50000.00,
          is_active: true,
          added_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          symbol: "ETHUSDT",
          price_drop: 12.3,
          current_price: 2800.75,
          historical_price: 3200.00,
          is_active: true,
          added_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
      setWatchlist(data);
    } catch (error) {
      console.error('Ошибка загрузки watchlist:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список отслеживания",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newItem.symbol || !newItem.price_drop || !newItem.current_price || !newItem.historical_price) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: newItem.symbol.toUpperCase(),
          price_drop: parseFloat(newItem.price_drop),
          current_price: parseFloat(newItem.current_price),
          historical_price: parseFloat(newItem.historical_price)
        })
      });

      if (response.ok) {
        await loadWatchlist();
        setNewItem({ symbol: '', price_drop: '', current_price: '', historical_price: '' });
        setShowAddForm(false);
        onUpdate();
        toast({
          title: "Успех",
          description: "Символ добавлен в список отслеживания",
        });
      }
    } catch (error) {
      console.error('Ошибка добавления:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить символ",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: number, is_active: boolean) => {
    try {
      const response = await fetch(`/api/watchlist/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active })
      });

      if (response.ok) {
        await loadWatchlist();
        onUpdate();
        toast({
          title: "Обновлено",
          description: `Символ ${is_active ? 'активирован' : 'деактивирован'}`,
        });
      }
    } catch (error) {
      console.error('Ошибка обновления:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить символ",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/watchlist/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadWatchlist();
        onUpdate();
        toast({
          title: "Удалено",
          description: "Символ удален из списка отслеживания",
        });
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить символ",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getPriceDropColor = (drop: number) => {
    if (drop > 20) return 'destructive';
    if (drop > 10) return 'warning';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Список отслеживания торговых пар
              </CardTitle>
              <CardDescription>
                Управление торговыми парами для мониторинга манипуляций
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              variant={showAddForm ? "outline" : "default"}
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить пару
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {showAddForm && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">Добавить новую торговую пару</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="symbol">Символ</Label>
                    <Input
                      id="symbol"
                      placeholder="BTCUSDT"
                      value={newItem.symbol}
                      onChange={(e) => setNewItem(prev => ({ ...prev, symbol: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price_drop">Падение цены (%)</Label>
                    <Input
                      id="price_drop"
                      type="number"
                      step="0.01"
                      placeholder="15.5"
                      value={newItem.price_drop}
                      onChange={(e) => setNewItem(prev => ({ ...prev, price_drop: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current_price">Текущая цена</Label>
                    <Input
                      id="current_price"
                      type="number"
                      step="0.00000001"
                      placeholder="45000.50"
                      value={newItem.current_price}
                      onChange={(e) => setNewItem(prev => ({ ...prev, current_price: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="historical_price">Историческая цена</Label>
                    <Input
                      id="historical_price"
                      type="number"
                      step="0.00000001"
                      placeholder="50000.00"
                      value={newItem.historical_price}
                      onChange={(e) => setNewItem(prev => ({ ...prev, historical_price: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewItem({ symbol: '', price_drop: '', current_price: '', historical_price: '' });
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Отмена
                  </Button>
                  <Button onClick={handleAdd}>
                    <Check className="h-4 w-4 mr-2" />
                    Добавить
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Символ</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Падение цены</TableHead>
                  <TableHead>Текущая цена</TableHead>
                  <TableHead>Историческая цена</TableHead>
                  <TableHead>Добавлен</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {watchlist.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={item.is_active ? "success" : "secondary"}>
                        {item.is_active ? "Активна" : "Неактивна"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriceDropColor(item.price_drop)}>
                        {item.price_drop}%
                      </Badge>
                    </TableCell>
                    <TableCell>{formatPrice(item.current_price)}</TableCell>
                    <TableCell>{formatPrice(item.historical_price)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.added_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={item.is_active}
                          onCheckedChange={(checked) => handleToggleActive(item.id, checked)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {watchlist.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Нет торговых пар в списке отслеживания
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}