import React, { useState } from 'react'
import { Plus, Edit, Trash2, Package } from 'lucide-react'

interface Part {
  name: string
  partNumber?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  inStock: boolean
}

interface PartsEditorProps {
  parts: Part[]
  onChange: (parts: Part[]) => void
  disabled?: boolean
}

const PartsEditor: React.FC<PartsEditorProps> = ({ parts, onChange, disabled = false }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const addPart = () => {
    const newPart: Part = {
      name: '',
      partNumber: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      inStock: true
    }
    const newParts = [...parts, newPart]
    onChange(newParts)
    setEditingIndex(newParts.length - 1)
  }

  const editPart = (index: number) => {
    setEditingIndex(index)
  }

  const updatePart = (index: number, field: keyof Part, value: string | number | boolean) => {
    const newParts = [...parts]
    const part = { ...newParts[index] }
    
    ;(part as any)[field] = value
    
    // Calculate total price when quantity or unit price changes
    if (field === 'quantity' || field === 'unitPrice') {
      part.totalPrice = part.quantity * part.unitPrice
    }
    
    newParts[index] = part
    onChange(newParts)
  }

  const deletePart = (index: number) => {
    const newParts = parts.filter((_, i) => i !== index)
    onChange(newParts)
    if (editingIndex === index) {
      setEditingIndex(null)
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1)
    }
  }

  const finishEditing = () => {
    setEditingIndex(null)
  }

  return (
    <div className="space-y-4">
      {/* Parts List */}
      <div className="space-y-2">
        {parts.map((part, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-lg border">
            {editingIndex === index ? (
              // Edit Mode
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Part Name *
                    </label>
                    <input
                      type="text"
                      value={part.name}
                      onChange={(e) => updatePart(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter part name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Part Number
                    </label>
                    <input
                      type="text"
                      value={part.partNumber || ''}
                      onChange={(e) => updatePart(index, 'partNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Optional part number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={part.quantity}
                      onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      value={part.unitPrice}
                      onChange={(e) => updatePart(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={part.inStock}
                        onChange={(e) => updatePart(index, 'inStock', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">In Stock</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Total: ${part.totalPrice.toFixed(2)}
                  </div>
                  <button
                    onClick={finishEditing}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{part.name || 'Unnamed Part'}</span>
                    {part.partNumber && (
                      <span className="text-sm text-gray-500">({part.partNumber})</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Qty: {part.quantity} × ${part.unitPrice.toFixed(2)} = ${part.totalPrice.toFixed(2)}
                    {!part.inStock && <span className="text-red-500 ml-2">• Out of Stock</span>}
                  </div>
                </div>
                {!disabled && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => editPart(index)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit Part"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePart(index)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Part"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Part Button */}
      {!disabled && (
        <button
          onClick={addPart}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Part
        </button>
      )}

      {/* Summary */}
      {parts.length > 0 && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Total Parts: {parts.length}</span>
            <span className="font-medium">
              Total Parts Cost: ${parts.reduce((sum, part) => sum + part.totalPrice, 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default PartsEditor

