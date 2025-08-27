
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { usePerfilEdit } from '../context/PerfilEditContext';
import { useAuth } from '../context/AuthContext';

// Vista de perfil profesional para candidato con todos los campos relevantes
export default function PerfilCandidato() {
  useEffect(() => {
    console.log('PerfilCandidato montado');
    return () => {
      console.log('PerfilCandidato desmontado');
    };
  }, []);
  // Estado editMode global por contexto
  const { editMode, setEditMode } = usePerfilEdit();
  useEffect(() => {
    console.log('editMode:', editMode);
  }, [editMode]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [perfil, setPerfil] = useState({
    nombre: '',
    candidatoId: null,
    email: '',
    telefono: '',
    ubicacion: '',
    avatar: null,
    bio: '',
    experiencia: '',
    educacion: '',
    habilidades: '',
    linkedin: '',
    cv: null
  });

  // Preparar datos para integración con API
  // Cargar datos reales del candidato al montar el componente
  useEffect(() => {
    async function fetchCandidatoByUserId() {
      try {
        setLoading(true);
        // Usar la nueva API optimizada que busca directamente por user_id
        const res = await api.get(`/candidatos/by-user/${user.id}`);
        const candidato = res.data;
        
        setPerfil({
          nombre: candidato.user?.name || '',
          candidatoId: candidato.id,
          email: candidato.user?.email || '',
          telefono: candidato.telefono || '',
          ubicacion: candidato.direccion || '',
          avatar: candidato.avatar || null,
          bio: candidato.bio || '',
          experiencia: candidato.experiencia_resumida || '',
          educacion: candidato.educacion_resumida || '',
          habilidades: candidato.habilidades || '',
          linkedin: candidato.linkedin || '',
          cv: candidato.cv_path || null
        });
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('No se encontró el perfil de candidato para este usuario');
        } else {
          setError('Error al cargar datos de perfil');
        }
        setLoading(false);
      }
    }
    if (user?.id) fetchCandidatoByUserId();
  }, [user?.id]);

  // Guardar cambios en la API
  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      // Mapear campos del frontend a los del backend
      formData.append('telefono', perfil.telefono);
      formData.append('direccion', perfil.ubicacion);
      formData.append('bio', perfil.bio);
      formData.append('experiencia_resumida', perfil.experiencia);
      formData.append('educacion_resumida', perfil.educacion);
      formData.append('habilidades', perfil.habilidades);
      formData.append('linkedin', perfil.linkedin);
      
      if (perfil.avatar instanceof File) formData.append('avatar', perfil.avatar);
      if (perfil.cv && typeof perfil.cv !== 'string') formData.append('cv', perfil.cv);
      
      await api.post(`/candidatos/${perfil.candidatoId}?_method=PUT`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setLoading(false);
      setEditMode(false); // Solo salir de edición si el guardado fue exitoso
    } catch (err) {
      console.error('Error al guardar:', err);
      setError('Error al guardar cambios: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  // Simulación de cambio de avatar (preparado para integración)
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPerfil(prev => ({ ...prev, avatar: e.target.files[0] }));
    }
  };
  // Simulación de carga de CV
  const handleCvChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPerfil(prev => ({ ...prev, cv: e.target.files[0] }));
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 60%, #ede7f6 100%)' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-lg border-0" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #e3f2fd 80%, #bbdefb 100%)' }}>
              <div className="card-body p-4">
                {loading && <div className="text-center text-primary mb-3">Cargando datos...</div>}
                {error && <div className="alert alert-danger mb-3">{error}</div>}
                <div className="d-flex flex-column align-items-center mb-4 position-relative">
                  <div className="position-relative mb-2" style={{ width: 120, height: 120 }}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 120, height: 120, background: 'linear-gradient(135deg, #1976d2 60%, #e3f2fd 100%)', boxShadow: '0 0 32px #1976d255', border: '4px solid #fff' }}>
                      {perfil.avatar ? (
                        <img src={perfil.avatar instanceof File ? URL.createObjectURL(perfil.avatar) : perfil.avatar} alt="avatar" style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 12px #1976d288' }} />
                      ) : (
                        <i className="bi bi-person-circle text-white" style={{ fontSize: '4.5rem' }}></i>
                      )}
                    </div>
                    {/* Input file invisible pero siempre activo sobre el avatar */}
                    <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ position: 'absolute', left: 0, top: 0, width: 120, height: 120, opacity: 0, cursor: 'pointer', zIndex: 3 }} title="Cambiar foto" />
                    {/* Icono y texto siempre visibles */}
                    <span className="position-absolute top-0 end-0 translate-middle p-2 bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ cursor: 'pointer', zIndex: 2 }} title="Cambiar foto">
                      <i className="bi bi-pencil text-white" style={{ fontSize: '1.2rem' }}></i>
                    </span>
                  </div>
                  <h3 className="fw-bold mb-1" style={{ color: '#1976d2' }}>{perfil.nombre}</h3>
                  <div className="text-secondary mb-2">{perfil.email}</div>
                </div>
                <form onSubmit={handleSave}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Nombre completo</label>
                      <input type="text" className="form-control" value={perfil.nombre} onChange={e => setPerfil(prev => ({ ...prev, nombre: e.target.value }))} disabled={!editMode} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Correo electrónico</label>
                      <input type="email" className="form-control" value={perfil.email} onChange={e => setPerfil(prev => ({ ...prev, email: e.target.value }))} disabled={!editMode} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Teléfono</label>
                      <input type="text" className="form-control" value={perfil.telefono} onChange={e => setPerfil(prev => ({ ...prev, telefono: e.target.value }))} disabled={!editMode} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Ubicación</label>
                      <input type="text" className="form-control" value={perfil.ubicacion} onChange={e => setPerfil(prev => ({ ...prev, ubicacion: e.target.value }))} disabled={!editMode} />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-semibold">Bio profesional</label>
                      <textarea className="form-control" rows={2} value={perfil.bio} onChange={e => setPerfil(prev => ({ ...prev, bio: e.target.value }))} disabled={!editMode} placeholder="Describe tu experiencia, habilidades y objetivos..." />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-semibold">Experiencia laboral</label>
                      <textarea className="form-control" rows={2} value={perfil.experiencia} onChange={e => setPerfil(prev => ({ ...prev, experiencia: e.target.value }))} disabled={!editMode} placeholder="Ejemplo: Empresa, puesto, años..." />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-semibold">Educación</label>
                      <textarea className="form-control" rows={2} value={perfil.educacion} onChange={e => setPerfil(prev => ({ ...prev, educacion: e.target.value }))} disabled={!editMode} placeholder="Ejemplo: Universidad, título, año..." />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-semibold">Habilidades</label>
                      <input type="text" className="form-control" value={perfil.habilidades} onChange={e => setPerfil(prev => ({ ...prev, habilidades: e.target.value }))} disabled={!editMode} placeholder="Ejemplo: React, Laravel, Inglés..." />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">LinkedIn</label>
                      <input type="text" className="form-control" value={perfil.linkedin} onChange={e => setPerfil(prev => ({ ...prev, linkedin: e.target.value }))} disabled={!editMode} placeholder="URL de perfil LinkedIn" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">CV adjunto</label>
                      <div className="d-flex align-items-center gap-2">
                        <input type="file" accept="application/pdf" onChange={handleCvChange} disabled={!editMode} />
                        {perfil.cv && <span className="badge bg-success">{typeof perfil.cv === 'string' ? perfil.cv : perfil.cv.name}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    {!editMode ? (
                      <button type="button" className="btn btn-primary px-4 py-2 fw-bold d-flex align-items-center" style={{ borderRadius: 14, fontSize: '1.15rem', boxShadow: '0 2px 8px #1976d222' }} onClick={() => setEditMode(true)}>
                        <i className="bi bi-pencil me-2" style={{ fontSize: '1.3rem' }}></i> Editar
                      </button>
                    ) : (
                      <>
                        <button type="submit" className="btn btn-success px-4 py-2 fw-bold d-flex align-items-center" style={{ borderRadius: 14, fontSize: '1.15rem' }}>
                          <i className="bi bi-check-lg me-2" style={{ fontSize: '1.3rem' }}></i> Guardar
                        </button>
                        <button type="button" className="btn btn-secondary px-4 py-2 fw-bold d-flex align-items-center" style={{ borderRadius: 14, fontSize: '1.15rem' }} onClick={() => setEditMode(false)}>
                          <i className="bi bi-x-lg me-2" style={{ fontSize: '1.3rem' }}></i> Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
