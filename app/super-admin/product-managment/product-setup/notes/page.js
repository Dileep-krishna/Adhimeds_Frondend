'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './notes.css';
import { deleteNoteAPI, getNotesAPI } from '../../../../services/noteAPI';

function NotesPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('all');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await getNotesAPI();
      if (response.success) {
        setNotes(response.data);
      } else {
        toast.error(response.message || 'Failed to load notes');
      }
    } catch (error) {
      console.error('Fetch notes error:', error);
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this note permanently?')) {
      try {
        const response = await deleteNoteAPI(id);
        if (response.success) {
          toast.success('Note deleted');
          fetchNotes(); // refresh list
        } else {
          toast.error(response.message || 'Delete failed');
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Network error');
      }
    }
  };

  const handleEdit = (note) => {
    const targetPath = `/super-admin/product-managment/product-setup/notes/editNote/${note._id}`;
    console.log('Navigating to:', targetPath);
    router.push(targetPath);
  };

  const filteredNotes = notes.filter(note => {
    if (activeFilter === 'inhouse') return note.user === 'In-House';
    if (activeFilter === 'seller') return note.user === 'Seller';
    return true;
  });

  return (
    <div className="notes-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="header-actions">
        <h4 className="page-title">All Notes</h4>
        <button className="btn-add" onClick={() => router.push('/super-admin/product-managment/product-setup/notes/addNote')}>
          + Add Note
        </button>
      </div>

      <div className="filter-bar">
        <div className="filter-buttons">
          <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All</button>
          <button className={`filter-btn ${activeFilter === 'inhouse' ? 'active' : ''}`} onClick={() => setActiveFilter('inhouse')}>In-House</button>
          <button className={`filter-btn ${activeFilter === 'seller' ? 'active' : ''}`} onClick={() => setActiveFilter('seller')}>Seller</button>
        </div>
        <div className="text-muted small">Seller Can Add Note? – This is a global setting (not implemented here)</div>
      </div>

      <div className="table-responsive">
        <table className="med-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Type</th>
              <th>Description</th>
              <th>Seller Can Access?</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotes.map((note, idx) => (
              <tr key={note._id}>
                <td>{idx + 1}</td>
                <td>{note.user}</td>
                <td>{note.type}</td>
                <td>{note.description}</td>
                <td>
                  <span className={`badge ${note.sellerCanAccess ? 'badge-success' : 'badge-secondary'}`}>
                    {note.sellerCanAccess ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>
                  <button className="btn-icon edit" onClick={() => handleEdit(note)}>
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className="btn-icon delete" onClick={() => handleDelete(note._id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
            {!loading && filteredNotes.length === 0 && (
              <tr><td colSpan="6" className="text-center">No notes found. Add one!</td></tr>
            )}
            {loading && (
              <tr><td colSpan="6" className="text-center">Loading...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default NotesPage;