'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createNoteAPI, getNoteByIdAPI, updateNoteAPI } from '../../../../../services/noteAPI';
 // adjust path as needed

export default function NoteFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const noteId = searchParams.get('id');

  const [formData, setFormData] = useState({
    user: 'In-House',
    type: '',
    description: '',
    sellerCanAccess: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!noteId);

  const noteTypes = ['Shipping', 'Refund', 'Warranty', 'Delivery', 'Medical Advice', 'Prescription', 'Lab Result'];

  // Fetch note data if editing
  useEffect(() => {
    if (noteId) {
      const fetchNote = async () => {
        try {
          console.log(`Fetching note with ID: ${noteId}`);
          const response = await getNoteByIdAPI(noteId);
          console.log('Get note response:', response);
          if (response.success) {
            const note = response.data;
            setFormData({
              user: note.user,
              type: note.type,
              description: note.description,
              sellerCanAccess: note.sellerCanAccess,
            });
            if (note.image) {
              // Construct full image URL if needed
              const imageUrl = note.image.startsWith('http') ? note.image : `${process.env.NEXT_PUBLIC_SERVERURL}/${note.image}`;
              setImagePreview(imageUrl);
            }
          } else {
            toast.error(response.message || 'Failed to load note');
            router.push('/super-admin/product-managment/product-setup/notes');
          }
        } catch (error) {
          console.error('Fetch note error:', error);
          toast.error('Network error while loading note');
          router.push('/super-admin/product-managment/product-setup/notes');
        } finally {
          setFetching(false);
        }
      };
      fetchNote();
    }
  }, [noteId, router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Image selected:', file.name, file.type, file.size);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.type || !formData.description) {
      toast.warn('Please fill all required fields (Type and Description)');
      return;
    }

    setLoading(true);
    console.log('Submitting note...', { noteId, formData, hasImageFile: !!imageFile });

    try {
      let response;
      // Prepare FormData if a new image file is selected
      if (imageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('user', formData.user);
        formDataToSend.append('type', formData.type);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('sellerCanAccess', formData.sellerCanAccess);
        formDataToSend.append('image', imageFile);

        if (noteId) {
          console.log('Updating note with FormData');
          response = await updateNoteAPI(noteId, formDataToSend);
        } else {
          console.log('Creating note with FormData');
          response = await createNoteAPI(formDataToSend);
        }
      } else {
        // Send as JSON (no image or keep existing)
        const payload = {
          user: formData.user,
          type: formData.type,
          description: formData.description,
          sellerCanAccess: formData.sellerCanAccess,
        };
        if (!noteId) {
          // For new note, explicitly set image to null (no image)
          payload.image = null;
        }
        if (noteId) {
          console.log('Updating note with JSON payload');
          response = await updateNoteAPI(noteId, payload);
        } else {
          console.log('Creating note with JSON payload');
          response = await createNoteAPI(payload);
        }
      }

      console.log('API response:', response);
      if (response.success) {
        toast.success(noteId ? 'Note updated successfully' : 'Note created successfully');
        router.push('/super-admin/product-managment/product-setup/notes');
      } else {
        toast.error(response.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Save note error:', error);
      toast.error('Something went wrong. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="text-center py-5">Loading note...</div>;
  }

  return (
    <div className="notes-form-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="form-header">
        <h4>{noteId ? 'Edit Note' : 'Add New Note'}</h4>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>User Type</label>
          <select name="user" className="form-control" value={formData.user} onChange={handleInputChange}>
            <option value="In-House">In-House</option>
            <option value="Seller">Seller</option>
          </select>
        </div>
        <div className="form-group">
          <label>Note Type *</label>
          <select name="type" className="form-control" value={formData.type} onChange={handleInputChange}>
            <option value="">Select Type</option>
            {noteTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Description *</label>
          <textarea name="description" className="form-control" rows="4" value={formData.description} onChange={handleInputChange}></textarea>
        </div>
        <div className="form-group">
          <label>Attach Image (optional)</label>
          <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="preview" className="image-preview" style={{ maxWidth: '200px' }} />
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="d-flex align-items-center gap-2">
            <input type="checkbox" name="sellerCanAccess" checked={formData.sellerCanAccess} onChange={handleInputChange} />
            Seller Can Access This Note
          </label>
        </div>
        <div className="form-buttons">
          <button type="button" className="btn-cancel" onClick={() => router.back()}>Cancel</button>
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? 'Saving...' : (noteId ? 'Update' : 'Save')}
          </button>
        </div>
      </form>
    </div>
  );
}