import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EvaluacionService from '../services/evaluacionService';

function CrearEvaluacion() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    candidato_id: '',
    titulo: '',
    descripcion: '',
    duracion_minutos: 60,
    categoria: 'general'
  });

  const [candidatos, setCandidatos] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    cargarCandidatos();
  }, []);

  const cargarCandidatos = async () => {
    try {
      setCandidatos([
        { id: 1, nombre: 'Juan', apellido: 'Pérez', email: 'juan@email.com' },
        { id: 2, nombre: 'María', apellido: 'González', email: 'maria@email.com' },
        { id: 3, nombre: 'Carlos', apellido: 'López', email: 'carlos@email.com' }
      ]);
    } catch (err) {
      console.error('Error al cargar candidatos:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errores[name]) {
      setErrores(prev => {
        const nuevosErrores = { ...prev };
        delete nuevosErrores[name];
        return nuevosErrores;
      });
    }
  };

  const generarPreguntasAleatorias = async () => {
    try {
      setLoading(true);
      const resultado = await EvaluacionService.obtenerPreguntasAleatorias(
        10,
        formData.categoria === 'general' ? null : formData.categoria,
        formData.duracion_minutos
      );
      
      if (resultado.success) {
        setPreguntas(resultado.data);
        setError(null);
      } else {
        alert(resultado.message);
      }
    } catch (err) {
      alert('Error al obtener preguntas aleatorias');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const validarFormulario = () => {
    const errores = {};
    
    if (!formData.candidato_id) {
      errores.candidato_id = 'Debes seleccionar un candidato';
    }
    
    if (!formData.titulo.trim()) {
      errores.titulo = 'El título es obligatorio';
    }
    
    if (formData.duracion_minutos < 15 || formData.duracion_minutos > 180) {
      errores.duracion_minutos = 'La duración debe estar entre 15 y 180 minutos';
    }
    
    setErrores(errores);
    return Object.keys(errores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const resultado = await EvaluacionService.crearEvaluacion({
        ...formData,
        preguntas: preguntas.map(p => p.id)
      });
      
      if (resultado.success) {
        alert('Evaluación creada correctamente');
        navigate('/gestion-evaluaciones');
      } else {
        setError(resultado.message);
      }
    } catch (err) {
      setError('Error inesperado al crear evaluación');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-plus me-2"></i>
                Crear Nueva Evaluación
              </h5>
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/gestion-evaluaciones')}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Volver
              </button>
            </div>
            
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-muted mb-3">
                      <i className="fas fa-info-circle me-2"></i>
                      Información Básica
                    </h6>
                    
                    <div className="mb-3">
                      <label htmlFor="candidato_id" className="form-label">
                        Candidato <span className="text-danger">*</span>
                      </label>
                      <select
                        className={'form-select ' + (errores.candidato_id ? 'is-invalid' : '')}
                        id="candidato_id"
                        name="candidato_id"
                        value={formData.candidato_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccionar candidato...</option>
                        {candidatos.map(candidato => (
                          <option key={candidato.id} value={candidato.id}>
                            {candidato.nombre} {candidato.apellido} - {candidato.email}
                          </option>
                        ))}
                      </select>
                      {errores.candidato_id && (
                        <div className="invalid-feedback">
                          {errores.candidato_id}
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="titulo" className="form-label">
                        Título de la Evaluación <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={'form-control ' + (errores.titulo ? 'is-invalid' : '')}
                        id="titulo"
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleInputChange}
                        placeholder="Ej: Evaluación para Desarrollador Frontend"
                        required
                      />
                      {errores.titulo && (
                        <div className="invalid-feedback">
                          {errores.titulo}
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="descripcion" className="form-label">
                        Descripción
                      </label>
                      <textarea
                        className="form-control"
                        id="descripcion"
                        name="descripcion"
                        rows={3}
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        placeholder="Descripción opcional de la evaluación..."
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <h6 className="text-muted mb-3">
                      <i className="fas fa-cog me-2"></i>
                      Configuración
                    </h6>
                    
                    <div className="mb-3">
                      <label htmlFor="duracion_minutos" className="form-label">
                        Duración (minutos) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className={'form-control ' + (errores.duracion_minutos ? 'is-invalid' : '')}
                        id="duracion_minutos"
                        name="duracion_minutos"
                        value={formData.duracion_minutos}
                        onChange={handleInputChange}
                        min="15"
                        max="180"
                        required
                      />
                      {errores.duracion_minutos && (
                        <div className="invalid-feedback">
                          {errores.duracion_minutos}
                        </div>
                      )}
                      <div className="form-text">
                        Tiempo límite entre 15 y 180 minutos
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="categoria" className="form-label">
                        Categoría
                      </label>
                      <select
                        className="form-select"
                        id="categoria"
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleInputChange}
                      >
                        <option value="general">General</option>
                        <option value="tecnica">Técnica</option>
                        <option value="logica">Lógica</option>
                        <option value="idiomas">Idiomas</option>
                        <option value="personalidad">Personalidad</option>
                      </select>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Preguntas</label>
                      <div className="d-grid">
                        <button
                          type="button"
                          className="btn btn-outline-info"
                          onClick={generarPreguntasAleatorias}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Generando...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-magic me-2"></i>
                              Generar Preguntas Aleatorias
                            </>
                          )}
                        </button>
                      </div>
                      {preguntas.length > 0 && (
                        <div className="mt-2">
                          <small className="text-success">
                            <i className="fas fa-check me-1"></i>
                            {preguntas.length} preguntas generadas
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {preguntas.length > 0 && (
                  <div className="row mt-4">
                    <div className="col-12">
                      <h6 className="text-muted mb-3">
                        <i className="fas fa-eye me-2"></i>
                        Vista Previa de Preguntas ({preguntas.length})
                      </h6>
                      <div className="border rounded p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {preguntas.map((pregunta, index) => (
                          <div key={pregunta.id} className="mb-2 p-2 bg-light rounded">
                            <small className="text-muted">Pregunta {index + 1}</small>
                            <div className="fw-medium">{pregunta.pregunta}</div>
                            <small className="text-muted">
                              Categoría: {pregunta.categoria} | 
                              Dificultad: {pregunta.dificultad}
                            </small>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/gestion-evaluaciones')}
                      >
                        <i className="fas fa-times me-2"></i>
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || preguntas.length === 0}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Creando...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Crear Evaluación
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CrearEvaluacion;
