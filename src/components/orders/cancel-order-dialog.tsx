'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { API_ROUTES } from '@/lib/constants';
import { AlertCircle, X } from 'lucide-react';

interface CancelOrderDialogProps {
  orderId: string;
  orderNumber: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CancelOrderDialog({
  orderId,
  orderNumber,
  isOpen,
  onClose,
  onSuccess,
}: CancelOrderDialogProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!reason.trim()) {
      setError('请选择或填写取消原因');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_ROUTES.orders.cancel(orderId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          reason: reason.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || '取消订单失败');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '取消订单失败');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setReason('');
    setError(null);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const reasons = [
    '不想要了',
    '价格变动',
    '发现更便宜的商品',
    '配送时间太长',
    '商品信息有误',
    '重复下单',
    '其他原因',
  ];

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md rounded-lg bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">取消订单</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              订单号: <span className="font-medium">{orderNumber}</span>
            </p>
            <p className="mt-1 text-sm text-gray-500">
              取消后库存将自动恢复，如已支付将安排退款。
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Reason Selection */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              取消原因 *
            </label>
            <div className="space-y-2">
              {reasons.map(r => (
                <label key={r} className="flex items-center">
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={e => setReason(e.target.value)}
                    disabled={loading}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{r}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          {reason === '其他原因' && (
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                请详细说明
              </label>
              <textarea
                value={reason === '其他原因' ? '' : reason}
                onChange={e => setReason(e.target.value)}
                placeholder="请填写取消原因..."
                disabled={loading}
                rows={3}
                className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-200 p-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            取消
          </Button>
          <Button
            onClick={handleCancel}
            disabled={loading || !reason.trim()}
            loading={loading}
            className="flex-1"
          >
            确认取消订单
          </Button>
        </div>
      </div>
    </div>
  );
}
