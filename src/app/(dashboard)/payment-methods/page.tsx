'use client';

import { CreditCard, Plus } from 'lucide-react';

export default function PaymentMethodsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">支付方式</h1>
        <p className="text-gray-600">管理您的支付方式和银行卡信息</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无支付方式</h3>
          <p className="text-gray-500 mb-4">添加您的银行卡或其他支付方式</p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            添加支付方式
          </button>
        </div>
      </div>
    </div>
  );
}