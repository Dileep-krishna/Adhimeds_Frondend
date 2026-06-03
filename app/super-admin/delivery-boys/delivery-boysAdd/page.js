'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addDeliveryBoyAPI } from '../../../services/deliveryService';
import DeliveryBoyForm from '../components/DeliveryBoyForm';

export default function AddDeliveryBoyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const addMutation = useMutation({
    mutationFn: (data) => addDeliveryBoyAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryBoys'] });
      showToast('Delivery boy added successfully!', 'success');
      router.push('/super-admin/delivery-boys');
    },
    onError: (err) => {
      showToast(`Add failed: ${err.message}`, 'error');
    },
  });

  const handleSubmit = (formData) => {
    const form = new FormData();
    form.append('name', formData.name);
    form.append('email', formData.email || '');
    form.append('phone', formData.phone);
    if (formData.password) form.append('password', formData.password);
    form.append('aadharNumber', formData.aadharNumber || '');
    form.append('licenseNumber', formData.licenseNumber || '');
    form.append('bikeNumber', formData.bikeNumber || '');
    form.append('district', formData.district);
    form.append('status', formData.status);
    if (formData.aadharImage) form.append('aadharImage', formData.aadharImage);
    if (formData.licenseImage) form.append('licenseImage', formData.licenseImage);
    addMutation.mutate(form);
  };

  return (
    <div className="container-fluid p-0">
      {/* Toast notification using Bootstrap alert */}
      {toast.show && (
        <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show m-3 position-fixed top-0 end-0`} style={{ zIndex: 1050, minWidth: '300px' }} role="alert">
          <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
          {toast.message}
          <button type="button" className="btn-close" onClick={() => setToast({ ...toast, show: false })}></button>
        </div>
      )}
      <DeliveryBoyForm
        title="Add New Delivery Boy"
        onSubmit={handleSubmit}
        isSubmitting={addMutation.isPending}
        submitLabel="Add Boy"
      />
    </div>
  );
}