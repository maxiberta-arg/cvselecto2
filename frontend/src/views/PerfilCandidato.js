
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Vista de perfil profesional para candidato con todos los campos relevantes
export default function PerfilCandidato() {
  const { user } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || user?.correo || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [ubicacion, setUbicacion] = useState(user?.ubicacion || '');
  const [avatar, setAvatar] = useState(null);
  const [bio, setBio] = useState(user?.bio || '');
  const [experiencia, setExperiencia] = useState(user?.experiencia || '');
  const [educacion, setEducacion] = useState(user?.educacion || '');
  const [habilidades, setHabilidades] = useState(user?.habilidades || '');
  const [linkedin, setLinkedin] = useState(user?.linkedin || '');
  const [cv, setCv] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Preparar datos para integración con API
  const handleSave = async (e) => {
    e.preventDefault();
    setEditMode(false);
    // Estructura FormData para enviar datos y archivos
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('email', email);
    formData.append('telefono', telefono);
    formData.append('ubicacion', ubicacion);
    formData.append('bio', bio);
    formData.append('experiencia', experiencia);
    formData.append('educacion', educacion);
    formData.append('habilidades', habilidades);
    formData.append('linkedin', linkedin);
    if (avatar instanceof File) formData.append('avatar', avatar);
    if (cv) formData.append('cv', cv);
    // Aquí iría la llamada real a la API, por ejemplo:
    // await axios.post('/api/candidatos/update', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    // Por ahora solo simula el guardado visual
  };

  // Simulación de cambio de avatar (preparado para integración)
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]); // Guardar el File para enviar a la API
    }
  };
  // Simulación de carga de CV
  const handleCvChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCv(e.target.files[0].name);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f2fd 60%, #ede7f6 100%)' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-lg border-0" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #e3f2fd 80%, #bbdefb 100%)' }}>
              <div className="card-body p-4">
                <div className="d-flex flex-column align-items-center mb-4 position-relative">
                  <div className="position-relative mb-2" style={{ width: 120, height: 120 }}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 120, height: 120, background: 'linear-gradient(135deg, #1976d2 60%, #e3f2fd 100%)', boxShadow: '0 0 32px #1976d255', border: '4px solid #fff' }}>
                      {avatar ? (
                        <img src={avatar instanceof File ? URL.createObjectURL(avatar) : avatar} alt="avatar" style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 12px #1976d288' }} />
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
                  <h3 className="fw-bold mb-1" style={{ color: '#1976d2' }}>{nombre}</h3>
                  <div className="text-secondary mb-2">{email}</div>
                </div>
                <form onSubmit={handleSave}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Nombre completo</label>
                      <input type="text" className="form-control" value={nombre} onChange={e => setNombre(e.target.value)} disabled={!editMode} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Correo electrónico</label>
                      <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} disabled={!editMode} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Teléfono</label>
                      <input type="text" className="form-control" value={telefono} onChange={e => setTelefono(e.target.value)} disabled={!editMode} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Ubicación</label>
                      <input type="text" className="form-control" value={ubicacion} onChange={e => setUbicacion(e.target.value)} disabled={!editMode} />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-semibold">Bio profesional</label>
                      <textarea className="form-control" rows={2} value={bio} onChange={e => setBio(e.target.value)} disabled={!editMode} placeholder="Describe tu experiencia, habilidades y objetivos..." />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-semibold">Experiencia laboral</label>
                      <textarea className="form-control" rows={2} value={experiencia} onChange={e => setExperiencia(e.target.value)} disabled={!editMode} placeholder="Ejemplo: Empresa, puesto, años..." />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-semibold">Educación</label>
                      <textarea className="form-control" rows={2} value={educacion} onChange={e => setEducacion(e.target.value)} disabled={!editMode} placeholder="Ejemplo: Universidad, título, año..." />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-semibold">Habilidades</label>
                      <input type="text" className="form-control" value={habilidades} onChange={e => setHabilidades(e.target.value)} disabled={!editMode} placeholder="Ejemplo: React, Laravel, Inglés..." />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">LinkedIn</label>
                      <input type="text" className="form-control" value={linkedin} onChange={e => setLinkedin(e.target.value)} disabled={!editMode} placeholder="URL de perfil LinkedIn" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">CV adjunto</label>
                      <div className="d-flex align-items-center gap-2">
                        <input type="file" accept="application/pdf" onChange={handleCvChange} disabled={!editMode} />
                        {cv && <span className="badge bg-success">{cv}</span>}
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
