'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, Edit, Trash2, Eye, 
  Calendar, Tag, User, MoreVertical, Image,
  Globe, MessageSquare, Star, TrendingUp
} from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  type: 'article' | 'page' | 'banner' | 'announcement';
  content: string;
  status: 'published' | 'draft' | 'archived';
  author: string;
  publishedAt: string;
  updatedAt: string;
  views: number;
  tags: string[];
  featured: boolean;
}

const typeConfig = {
  article: { label: '文章', color: 'bg-blue-100 text-blue-800', icon: FileText },
  page: { label: '页面', color: 'bg-green-100 text-green-800', icon: Globe },
  banner: { label: '横幅', color: 'bg-purple-100 text-purple-800', icon: Image },
  announcement: { label: '公告', color: 'bg-orange-100 text-orange-800', icon: MessageSquare },
};

const statusConfig = {
  published: { label: '已发布', color: 'bg-green-100 text-green-800' },
  draft: { label: '草稿', color: 'bg-yellow-100 text-yellow-800' },
  archived: { label: '已归档', color: 'bg-gray-100 text-gray-800' },
};

export default function AdminContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      
      // Mock data - 在实际项目中这里会调用API
      const mockContent: ContentItem[] = [
        {
          id: '1',
          title: '2024年春季新品发布会',
          type: 'article',
          content: '我们很高兴地宣布即将举办2024年春季新品发布会...',
          status: 'published',
          author: '市场部',
          publishedAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z',
          views: 1250,
          tags: ['新品', '发布会', '春季'],
          featured: true
        },
        {
          id: '2',
          title: '关于我们 - 公司介绍',
          type: 'page',
          content: 'ShopNext是一家专注于电商解决方案的公司...',
          status: 'published',
          author: '管理员',
          publishedAt: '2024-01-15T09:30:00Z',
          updatedAt: '2024-01-18T14:20:00Z',
          views: 890,
          tags: ['公司', '介绍'],
          featured: false
        },
        {
          id: '3',
          title: '新年促销活动横幅',
          type: 'banner',
          content: '新年大促，全场8折起，限时优惠！',
          status: 'published',
          author: '设计师',
          publishedAt: '2024-01-10T12:00:00Z',
          updatedAt: '2024-01-10T12:00:00Z',
          views: 3200,
          tags: ['促销', '新年', '横幅'],
          featured: true
        },
        {
          id: '4',
          title: '系统维护通知',
          type: 'announcement',
          content: '系统将在本周六凌晨2点进行例行维护...',
          status: 'draft',
          author: '技术部',
          publishedAt: '',
          updatedAt: '2024-01-19T16:45:00Z',
          views: 0,
          tags: ['维护', '通知'],
          featured: false
        },
        {
          id: '5',
          title: '客户服务政策更新',
          type: 'article',
          content: '为了更好地服务客户，我们更新了服务政策...',
          status: 'archived',
          author: '客服部',
          publishedAt: '2023-12-15T11:20:00Z',
          updatedAt: '2024-01-05T09:10:00Z',
          views: 450,
          tags: ['政策', '客服'],
          featured: false
        }
      ];
      
      setContent(mockContent);
    } catch (error) {
      console.error('获取内容失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const toggleFeatured = (itemId: string) => {
    setContent(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, featured: !item.featured }
        : item
    ));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '未发布';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">内容管理</h1>
          <p className="text-gray-600">管理网站内容、文章和页面</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
          <Plus className="h-4 w-4" />
          创建内容
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总内容数</p>
              <p className="text-2xl font-bold text-gray-900">{content.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">已发布</p>
              <p className="text-2xl font-bold text-gray-900">
                {content.filter(item => item.status === 'published').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">草稿</p>
              <p className="text-2xl font-bold text-gray-900">
                {content.filter(item => item.status === 'draft').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Edit className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总浏览量</p>
              <p className="text-2xl font-bold text-gray-900">
                {content.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索内容标题或内容..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">所有类型</option>
              <option value="article">文章</option>
              <option value="page">页面</option>
              <option value="banner">横幅</option>
              <option value="announcement">公告</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">所有状态</option>
              <option value="published">已发布</option>
              <option value="draft">草稿</option>
              <option value="archived">已归档</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {filteredContent.map((item) => {
          const TypeIcon = typeConfig[item.type].icon;
          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${typeConfig[item.type].color}`}>
                      <TypeIcon className="h-3 w-3" />
                      {typeConfig[item.type].label}
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig[item.status].color}`}>
                      {statusConfig[item.status].label}
                    </div>
                    {item.featured && (
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        <Star className="h-3 w-3 fill-current" />
                        精选
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{truncateContent(item.content)}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {item.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(item.publishedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {item.views.toLocaleString()} 次浏览
                    </div>
                  </div>
                  
                  {item.tags.length > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <Tag className="h-3 w-3 text-gray-400" />
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleFeatured(item.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      item.featured 
                        ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' 
                        : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                    }`}
                  >
                    <Star className={`h-4 w-4 ${item.featured ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无内容</h3>
          <p className="text-gray-500 mb-4">没有找到符合条件的内容</p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            创建第一个内容
          </button>
        </div>
      )}
    </div>
  );
}