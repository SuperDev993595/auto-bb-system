import { useState, useEffect } from 'react'
import { Tag, Users, Filter, Plus, Edit, Trash2, Target, DollarSign } from '../../../utils/icons'

interface CustomerSegment {
  id: string
  name: string
  description: string
  customerCount: number
  totalValue: number
  color: string
  isActive: boolean
}

interface CustomerTag {
  id: string
  name: string
  color: string
  description: string
  usageCount: number
}

interface Props {
  customerId?: string
}

export default function CustomerSegmentation({ customerId }: Props) {
  const [segments, setSegments] = useState<CustomerSegment[]>([])
  const [tags, setTags] = useState<CustomerTag[]>([])
  const [activeTab, setActiveTab] = useState<'segments' | 'tags'>('segments')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSegmentationData()
  }, [customerId])

  const fetchSegmentationData = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockSegments: CustomerSegment[] = [
      {
        id: '1',
        name: 'High-Value Customers',
        description: 'Customers with high revenue and multiple vehicles',
        customerCount: 45,
        totalValue: 125000,
        color: '#10B981',
        isActive: true
      },
      {
        id: '2',
        name: 'Fleet Customers',
        description: 'Business customers with fleet vehicles',
        customerCount: 23,
        totalValue: 89000,
        color: '#8B5CF6',
        isActive: true
      }
    ]

    const mockTags: CustomerTag[] = [
      {
        id: '1',
        name: 'VIP',
        color: '#EF4444',
        description: 'Very Important Customer',
        usageCount: 12
      },
      {
        id: '2',
        name: 'Frequent Service',
        color: '#3B82F6',
        description: 'Regular service customers',
        usageCount: 89
      }
    ]

    setSegments(mockSegments)
    setTags(mockTags)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Segmentation</h2>
            <p className="text-gray-600">Organize and categorize customers for better targeting</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200">
              <Plus className="w-4 h-4" />
              New Tag
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200">
              <Plus className="w-4 h-4" />
              New Segment
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{segments.length}</p>
            <p className="text-sm text-blue-600">Total Segments</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{tags.length}</p>
            <p className="text-sm text-green-600">Total Tags</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              ${(segments.reduce((sum, seg) => sum + seg.totalValue, 0) / 1000).toFixed(0)}k
            </p>
            <p className="text-sm text-purple-600">Total Value</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {(['segments', 'tags'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Segments Tab */}
          {activeTab === 'segments' && (
            <div className="space-y-4">
              {segments.map((segment) => (
                <div key={segment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div 
                        className="w-4 h-4 rounded-full mt-1"
                        style={{ backgroundColor: segment.color }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{segment.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            segment.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {segment.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{segment.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-600">{segment.customerCount} customers</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600">${segment.totalValue.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200" title="Edit Segment">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200" title="Delete Segment">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tags Tab */}
          {activeTab === 'tags' && (
            <div className="space-y-4">
              {tags.map((tag) => (
                <div key={tag.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      ></div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{tag.name}</h3>
                        <p className="text-gray-600">{tag.description}</p>
                        <p className="text-sm text-gray-500">Used {tag.usageCount} times</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200" title="Edit Tag">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200" title="Delete Tag">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
