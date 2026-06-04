'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getAllRoles, deleteRole } from '../../../services/permissionService';
import './roles-all.css';
export default function AllRolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch roles from API
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await getAllRoles();
      if (res.success) {
        setRoles(res.data);
      } else {
        toast.error(res.message || 'Failed to load roles');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error while loading roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Delete role with confirmation
  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete the role "${name}"?`)) return;
    setDeletingId(id);
    try {
      const res = await deleteRole(id);
      if (res.success) {
        toast.success(`Role "${name}" deleted successfully`);
        fetchRoles(); // refresh list
      } else {
        toast.error(res.message || 'Delete failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error while deleting');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container-fluid py-4 roles-page">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h1 className="display-6 fw-bold text-dark mb-0">
            <i className="bi bi-person-badge me-2 text-primary"></i> All Roles
          </h1>
          <p className="text-muted mt-1">Manage system roles and permissions</p>
        </div>
        <Link href="/super-admin/staff/RoleAdd" className="btn btn-primary rounded-pill px-4 shadow-sm">
          <i className="bi bi-plus-circle me-2"></i> Add New Role
        </Link>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th scope="col" style={{ width: '80px' }}>#</th>
                  <th scope="col">Name</th>
                  <th scope="col" style={{ width: '120px' }}>Options</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-1"></i>
                      <p className="mt-2">No roles found. Click “Add New Role” to create one.</p>
                    </td>
                  </tr>
                ) : (
                  roles.map((role, idx) => (
                    <tr key={role._id}>
                      <td className="fw-semibold">{idx + 1}</td>
                      <td className="fw-medium">{role.name}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link
                            href={`/super-admin/staff/rolesEdit/${role._id}`}
                            className="btn btn-sm btn-outline-warning rounded-circle"
                            style={{ width: '32px', height: '32px', lineHeight: '1' }}
                            title="Edit Role"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-circle"
                            style={{ width: '32px', height: '32px', lineHeight: '1' }}
                            onClick={() => handleDelete(role._id, role.name)}
                            disabled={deletingId === role._id}
                            title="Delete Role"
                          >
                            {deletingId === role._id ? (
                              <span className="spinner-border spinner-border-sm" style={{ width: '1rem', height: '1rem' }}></span>
                            ) : (
                              <i className="bi bi-trash3"></i>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}