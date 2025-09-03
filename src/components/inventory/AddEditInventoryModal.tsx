import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux';
import { createInventoryItem, updateInventoryItem } from '../../redux/actions/inventory';
import { InventoryItem, CreateInventoryItemData, UpdateInventoryItemData } from '../../services/inventory';
import { Save, Plus } from '../../utils/icons';
import { toast } from 'react-hot-toast';
import ModalWrapper from '../../utils/ModalWrapper';

interface AddEditInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: InventoryItem | null;
  mode: 'add' | 'edit';
}

export default function AddEditInventoryModal({ isOpen, onClose, item, mode }: AddEditInventoryModalProps) {
  const dispatch = useAppDispatch();
  const { suppliers, categories, locations } = useAppSelector(state => state.inventory);
  
  const [formData, setFormData] = useState<CreateInventoryItemData>({
    name: '',
    description: '',
    partNumber: '',
    category: '',
    subcategory: '',
    brand: '',
    model: '',
    year: '',
    location: '',
    quantityOnHand: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    reorderPoint: 0,
    costPrice: 0,
    sellingPrice: 0,
    supplierId: '',
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData({
        name: item.name,
        description: item.description,
        partNumber: item.partNumber,
        category: item.category,
        subcategory: item.subcategory || '',
        brand: item.brand || '',
        model: item.model || '',
        year: item.year || '',
        location: typeof item.location === 'object' && item.location
          ? `${item.location.warehouse || ''} ${item.location.shelf || ''} ${item.location.bin || ''}`.trim()
          : (item.location as string) || '',
        quantityOnHand: item.quantityOnHand,
        minStockLevel: item.minStockLevel,
        maxStockLevel: item.maxStockLevel,
        reorderPoint: item.reorderPoint || 0,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice,
        supplierId: typeof item.supplier === 'object' && item.supplier 
          ? (item.supplier as any)._id || (item.supplier as any).id
          : item.supplier,
        isActive: item.isActive
      });
    } else {
      setFormData({
        name: '',
        description: '',
        partNumber: '',
        category: '',
        subcategory: '',
        brand: '',
        model: '',
        year: '',
        location: '',
        quantityOnHand: 0,
        minStockLevel: 0,
        maxStockLevel: 0,
        reorderPoint: 0,
        costPrice: 0,
        sellingPrice: 0,
        supplierId: '',
        isActive: true
      });
    }
    setErrors({});
  }, [item, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.partNumber.trim()) newErrors.partNumber = 'Part number is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.supplierId) newErrors.supplierId = 'Supplier is required';
    if (formData.costPrice < 0) newErrors.costPrice = 'Cost price must be positive';
    if (formData.sellingPrice < 0) newErrors.sellingPrice = 'Selling price must be positive';
    if (formData.quantityOnHand < 0) newErrors.quantityOnHand = 'Quantity must be positive';
    if (formData.minStockLevel < 0) newErrors.minStockLevel = 'Minimum stock level must be positive';
    if (formData.maxStockLevel < formData.minStockLevel) {
      newErrors.maxStockLevel = 'Maximum stock level must be greater than minimum';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (mode === 'add') {
        await dispatch(createInventoryItem(formData)).unwrap();
        toast.success('Inventory item created successfully!');
      } else {
        if (!item?._id) {
          toast.error('Item ID is missing');
          return;
        }
        const updateData: UpdateInventoryItemData = {
          ...formData
        };
        await dispatch(updateInventoryItem({ id: item._id, itemData: updateData })).unwrap();
        toast.success('Inventory item updated successfully!');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save inventory item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateInventoryItemData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Add New Inventory Item' : 'Edit Inventory Item'}
      submitText={mode === 'add' ? 'Add Item' : 'Update Item'}
      onSubmit={handleSubmit}
      submitColor="bg-blue-600"
      size="xl"
    >
      <div className="p-8 space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white ${
                  errors.name ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Enter item name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Part Number *
              </label>
              <input
                type="text"
                value={formData.partNumber}
                onChange={(e) => handleInputChange('partNumber', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white ${
                  errors.partNumber ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Enter part number"
              />
              {errors.partNumber && <p className="mt-1 text-sm text-red-600">{errors.partNumber}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="Enter item description"
              />
            </div>
          </div>

          {/* Category and Brand Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white ${
                  errors.category ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <option value="">Select category</option>
                {(categories && Array.isArray(categories) ? categories : []).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory
              </label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="Enter subcategory"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="Enter brand"
              />
            </div>
          </div>

          {/* Model and Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="Enter model"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="Enter year"
              />
            </div>
          </div>

          {/* Location and Supplier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <select
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white ${
                  errors.location ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <option value="">Select location</option>
                {(locations && Array.isArray(locations) ? locations : []).map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier *
              </label>
              <select
                value={formData.supplierId}
                onChange={(e) => handleInputChange('supplierId', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white ${
                  errors.supplierId ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <option value="">Select supplier</option>
                {(suppliers && Array.isArray(suppliers) ? suppliers : []).map(supplier => (
                  <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
                ))}
              </select>
              {errors.supplierId && <p className="mt-1 text-sm text-red-600">{errors.supplierId}</p>}
            </div>
          </div>

          {/* Stock Levels */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stock *
              </label>
              <input
                type="number"
                value={formData.quantityOnHand}
                onChange={(e) => handleInputChange('quantityOnHand', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white ${
                  errors.quantityOnHand ? 'border-red-500' : 'border-gray-200'
                }`}
                min="0"
              />
              {errors.quantityOnHand && <p className="mt-1 text-sm text-red-600">{errors.quantityOnHand}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Stock Level
              </label>
              <input
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => handleInputChange('minStockLevel', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white ${
                  errors.minStockLevel ? 'border-red-500' : 'border-gray-200'
                }`}
                min="0"
              />
              {errors.minStockLevel && <p className="mt-1 text-sm text-red-600">{errors.minStockLevel}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Stock Level
              </label>
              <input
                type="number"
                value={formData.maxStockLevel}
                onChange={(e) => handleInputChange('maxStockLevel', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white ${
                  errors.maxStockLevel ? 'border-red-500' : 'border-gray-200'
                }`}
                min="0"
              />
              {errors.maxStockLevel && <p className="mt-1 text-sm text-red-600">{errors.maxStockLevel}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reorder Point
              </label>
              <input
                type="number"
                value={formData.reorderPoint}
                onChange={(e) => handleInputChange('reorderPoint', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                min="0"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Price *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => handleInputChange('costPrice', parseFloat(e.target.value) || 0)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white ${
                    errors.costPrice ? 'border-red-500' : 'border-gray-200'
                  }`}
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.costPrice && <p className="mt-1 text-sm text-red-600">{errors.costPrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) => handleInputChange('sellingPrice', parseFloat(e.target.value) || 0)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white ${
                    errors.sellingPrice ? 'border-red-500' : 'border-gray-200'
                  }`}
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.sellingPrice && <p className="mt-1 text-sm text-red-600">{errors.sellingPrice}</p>}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-md"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>
        </div>
    </ModalWrapper>
  );
}
