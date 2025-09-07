import React, { useState } from 'react';
import { StrategyService } from 'entities/strategy/strategy-service';
import { Button } from 'shared/ui/Button';

interface CreateStrategyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStrategyCreated: () => void;
}

export const CreateStrategyModal: React.FC<CreateStrategyModalProps> = ({
    isOpen,
    onClose,
    onStrategyCreated
}) => {
    const [name, setName] = useState('');
    const [bank, setBank] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const strategyService = StrategyService.getInstance();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim() || !bank.trim()) {
            return;
        }

        const bankAmount = parseFloat(bank);
        if (isNaN(bankAmount) || bankAmount <= 0) {
            return;
        }

        setIsLoading(true);
        
        try {
            strategyService.createStrategy(name.trim(), bankAmount);
            onStrategyCreated();
            handleClose();
        } catch (error) {
            console.error('Ошибка создания стратегии:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setName('');
        setBank('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">Создать стратегию</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Название стратегии
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Введите название стратегии"
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Размер банка (₽)
                        </label>
                        <input
                            type="number"
                            value={bank}
                            onChange={(e) => setBank(e.target.value)}
                            placeholder="10000"
                            min="1"
                            step="1"
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isLoading || !name.trim() || !bank.trim()}
                            className="flex-1"
                        >
                            {isLoading ? 'Создание...' : 'Создать'}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                            className="flex-1"
                        >
                            Отмена
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
