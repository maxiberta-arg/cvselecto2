import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Vista de perfil profesional para empresa
export default function PerfilEmpresa() {
  const { user } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || user?.correo || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [ubicacion, setUbicacion] = useState(user?.ubicacion || '');
  const [logo, setLogo] = useState(null);
  const [descripcion, setDescripcion] = useState(user?.descripcion || '');
  const [rubro, setRubro] = useState(user?.rubro || '');
  const [web, setWeb] = useState(user?.web || '');
  const [linkedin, setLinkedin] = useState(user?.linkedin || '');
  const [instagram, setInstagram] = useState(user?.instagram || '');
  const [editMode, setEditMode] = useState(false);

  // Simulación de guardar cambios
  const handleSave = async (e) => {
    e.preventDefault();
    setEditMode(false);
    // Preparar datos para integración API
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('email', email);
    formData.append('telefono', telefono);
    formData.append('ubicacion', ubicacion);
    formData.append('descripcion', descripcion);
    formData.append('rubro', rubro);
    formData.append('web', web);
    formData.append('linkedin', linkedin);
    formData.append('instagram', instagram);
    if (logo instanceof File) formData.append('logo', logo);
    // Aquí iría la llamada real a la API
  };

  // Simulación de cambio de logo
  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0]);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fffde7 60%, #ede7f6 100%)' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-lg border-0" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #fffde7 80%, #ffe082 100%)' }}>
              <div className="card-body p-4">
                <div className="d-flex flex-column align-items-center mb-4 position-relative">
                  <div className="position-relative mb-2" style={{ width: 120, height: 120 }}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 120, height: 120, background: 'linear-gradient(135deg, #fbc02d 60%, #fffde7 100%)', boxShadow: '0 0 32px #fbc02d55', border: '4px solid #fff' }}>
                      {logo ? (
                        <img src={logo instanceof File ? URL.createObjectURL(logo) : logo} alt="logo" style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 12px #fbc02d88' }} />
                      ) : (
                        <i className="bi bi-building text-white" style={{ fontSize: '4.5rem' }}></i>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleLogoChange} style={{ position: 'absolute', left: 0, top: 0, width: 120, height: 120, opacity: 0, cursor: 'pointer', zIndex: 3 }} title="Cambiar logo" />
                    <span className="position-absolute top-0 end-0 translate-middle p-2 bg-warning rounded-circle d-flex align-items-center justify-content-center" style={{ cursor: 'pointer', zIndex: 2 }} title="Cambiar logo">
                      <i className="bi bi-pencil text-white" style={{ fontSize: '1.2rem' }}></i>
                    </span>
                  </div>
                  <h3 className="fw-bold mb-1" style={{ color: '#fbc02d' }}>{nombre}</h3>
                  <div className="text-secondary mb-2">{email}</div>
                </div>
                <form onSubmit={handleSave}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Nombre de la empresa</label>
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
                      <label className="form-label fw-semibold">Descripción</label>
                      <textarea className="form-control" rows={2} value={descripcion} onChange={e => setDescripcion(e.target.value)} disabled={!editMode} placeholder="Describe la empresa, misión, valores..." />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Rubro</label>
                      <input type="text" className="form-control" value={rubro} onChange={e => setRubro(e.target.value)} disabled={!editMode} placeholder="Ejemplo: Tecnología, Salud..." />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Sitio web</label>
                      <input type="text" className="form-control" value={web} onChange={e => setWeb(e.target.value)} disabled={!editMode} placeholder="URL del sitio web" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">LinkedIn</label>
                      <input type="text" className="form-control" value={linkedin} onChange={e => setLinkedin(e.target.value)} disabled={!editMode} placeholder="URL de LinkedIn" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Instagram</label>
                      <input type="text" className="form-control" value={instagram} onChange={e => setInstagram(e.target.value)} disabled={!editMode} placeholder="@usuario" />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    {!editMode ? (
                      <button type="button" className="btn btn-warning px-4 py-2 fw-bold d-flex align-items-center" style={{ borderRadius: 14, fontSize: '1.15rem', boxShadow: '0 2px 8px #fbc02d22' }} onClick={() => setEditMode(true)}>
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
