import React, { useState, useEffect } from 'react';
import { HiTruck } from 'react-icons/hi';
import ModalWrapper from '../../../utils/ModalWrapper';

interface VehicleFormData {
  year: string;
  make: string;
  model: string;
  vin: string;
  licensePlate: string;
  color: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  status: string;
}

interface AddEditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VehicleFormData) => void;
  vehicle?: VehicleFormData | null;
  isEditing?: boolean;
}

export default function AddEditVehicleModal({
  isOpen,
  onClose,
  onSubmit,
  vehicle,
  isEditing = false
}: AddEditVehicleModalProps) {
  const [formData, setFormData] = useState<VehicleFormData>({
    year: '',
    make: '',
    model: '',
    vin: '',
    licensePlate: '',
    color: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    status: 'active'
  });

  useEffect(() => {
    if (vehicle && isEditing) {
      setFormData(vehicle);
    } else {
      setFormData({
        year: '',
        make: '',
        model: '',
        vin: '',
        licensePlate: '',
        color: '',
        mileage: '',
        fuelType: '',
        transmission: '',
        status: 'active'
      });
    }
  }, [vehicle, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
      icon={<HiTruck className="w-5 h-5" />}
      submitText={isEditing ? 'Update Vehicle' : 'Add Vehicle'}
      onSubmit={handleSubmit}
      submitColor="bg-blue-600"
    >
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Year *</label>
            <input
              type="text"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className="form-input"
              placeholder="2020"
              maxLength={4}
            />
          </div>
          <div>
            <label className="form-label">Color *</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Silver"
            />
          </div>
        </div>
        
        <div>
          <label className="form-label">Make *</label>
          <input
            type="text"
            name="make"
            value={formData.make}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Toyota"
          />
        </div>
        
        <div>
          <label className="form-label">Model *</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Camry"
          />
        </div>
        
        <div>
          <label className="form-label">VIN (17 characters) *</label>
          <input
            type="text"
            name="vin"
            value={formData.vin}
            onChange={handleInputChange}
            className="form-input font-mono"
            placeholder="1HGBH41JXMN109186"
            maxLength={17}
          />
        </div>
        
        <div>
          <label className="form-label">License Plate *</label>
          <input
            type="text"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleInputChange}
            className="form-input"
            placeholder="ABC123"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Mileage *</label>
            <input
              type="number"
              name="mileage"
              value={formData.mileage}
              onChange={handleInputChange}
              className="form-input"
              placeholder="45000"
              min="0"
            />
          </div>
          <div>
            <label className="form-label">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Fuel Type</label>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Select fuel type</option>
              <option value="gasoline">Gasoline</option>
              <option value="diesel">Diesel</option>
              <option value="hybrid">Hybrid</option>
              <option value="electric">Electric</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="form-label">Transmission</label>
            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Select transmission</option>
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
              <option value="cvt">CVT</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        

      </div>
    </ModalWrapper>
  );
}
