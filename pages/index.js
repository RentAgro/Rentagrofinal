import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [empresaId, setEmpresaId] = useState('');
  const [campaniaId, setCampaniaId] = useState('');
  const [loteId, setLoteId] = useState('');

  const [costos, setCostos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [mensaje, setMensaje] = useState('');

  const [empresaNombre, setEmpresaNombre] = useState('Mi empresa');
  const [campaniaNombre, setCampaniaNombre] = useState('2024/25');
  const [loteNombre, setLoteNombre] = useState('Lote Norte');
  const [loteHa, setLoteHa] = useState(100);

  const [costo, setCosto] = useState({
    fecha: new Date().toISOString().slice(0,10),
    cultivo: 'Soja',
    tipo_costo: 'Herbicida',
    concepto: '',
    cantidad_por_ha: 0,
    costo_unitario: 0,
    hectareas: 0
  });

  const [venta, setVenta] = useState({
    fecha: new Date().toISOString().slice(0,10),
    cultivo: 'Soja',
    toneladas: 0,
    precio_tn: 0,
    comprador: ''
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      const e = localStorage.getItem('empresaId');
      const c = localStorage.getItem('campaniaId');
      const l = localStorage.getItem('loteId');
      if (e) setEmpresaId(e);
      if (c) setCampaniaId(c);
      if (l) setLoteId(l);
    }
  }, [session]);

  useEffect(() => {
    if (empresaId) cargarDatos();
  }, [empresaId]);

  async function registrar() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return setMensaje(error.message);
    setMensaje('Usuario creado. Revisá tu correo si Supabase pide confirmación.');
  }

  async function ingresar() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setMensaje(error.message);
    setMensaje('Ingreso correcto.');
  }

  async function salir() {
    await supabase.auth.signOut();
    setSession(null);
  }

  async function crearEmpresa() {
    const { data, error } = await supabase
      .from('empresas')
      .insert({ nombre: empresaNombre, pais: 'Argentina' })
      .select()
      .single();

    if (error) return setMensaje(error.message);

    setEmpresaId(data.id);
    localStorage.setItem('empresaId', data.id);

    await supabase.from('usuarios_empresa').insert({
      user_id: session.user.id,
      empresa_id: data.id,
      nombre: session.user.email,
      email: session.user.email,
      rol: 'admin'
    });

    setMensaje('Empresa creada.');
  }

  async function crearCampania() {
    if (!empresaId) return setMensaje('Primero creá una empresa.');

    const { data, error } = await supabase
      .from('campanias')
      .insert({ empresa_id: empresaId, nombre: campaniaNombre })
      .select()
      .single();

    if (error) return setMensaje(error.message);

    setCampaniaId(data.id);
    localStorage.setItem('campaniaId', data.id);
    setMensaje('Campaña creada.');
  }

  async function crearLote() {
    if (!empresaId) return setMensaje('Primero creá una empresa.');

    const { data, error } = await supabase
      .from('lotes')
      .insert({ empresa_id: empresaId, nombre: loteNombre, superficie_ha: Number(loteHa) })
      .select()
      .single();

    if (error) return setMensaje(error.message);

    setLoteId(data.id);
    localStorage.setItem('loteId', data.id);
    setMensaje('Lote creado.');
  }

  async function guardarCosto() {
    if (!empresaId || !campaniaId || !loteId) return setMensaje('Creá empresa, campaña y lote primero.');

    const { error } = await supabase.from('costos_agricolas').insert({
      empresa_id: empresaId,
      campania_id: campaniaId,
      lote_id: loteId,
      fecha: costo.fecha,
      cultivo: costo.cultivo,
      tipo_costo: costo.tipo_costo,
      concepto: costo.concepto,
      cantidad_por_ha: Number(costo.cantidad_por_ha),
      costo_unitario: Number(costo.costo_unitario),
      hectareas: Number(costo.hectareas),
      creado_por: session.user.id
    });

    if (error) return setMensaje(error.message);
    setMensaje('Costo guardado.');
    cargarDatos();
  }

  async function guardarVenta() {
    if (!empresaId || !campaniaId) return setMensaje('Creá empresa y campaña primero.');

    const { error } = await supabase.from('ventas_agricolas').insert({
      empresa_id: empresaId,
      campania_id: campaniaId,
      fecha: venta.fecha,
      cultivo: venta.cultivo,
      toneladas: Number(venta.toneladas),
      precio_tn: Number(venta.precio_tn),
      comprador: venta.comprador,
      creado_por: session.user.id
    });

    if (error) return setMensaje(error.message);
    setMensaje('Venta guardada.');
    cargarDatos();
  }

  async function cargarDatos() {
    const costosRes = await supabase
      .from('costos_agricolas')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('fecha', { ascending: false });

    const ventasRes = await supabase
      .from('ventas_agricolas')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('fecha', { ascending: false });

    setCostos(costosRes.data || []);
    setVentas(ventasRes.data || []);
  }

  const totalCostos = costos.reduce((a, r) => a + Number(r.costo_total || 0), 0);
  const totalVentas = ventas.reduce((a, r) => a + Number(r.ingreso_total || 0), 0);

  if (!session) {
    return (
      <main className="container">
        <h1>Rent<span>Agro</span></h1>
        <p>Login real conectado a Supabase.</p>

        <section className="card">
          <h2>Ingresar</h2>
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={ingresar}>Ingresar</button>
          <button className="dark" onClick={registrar}>Crear usuario</button>
          <p className="msg">{mensaje}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      <header className="top">
        <div>
          <h1>Rent<span>Agro</span></h1>
          <p>{session.user.email}</p>
        </div>
        <button className="danger" onClick={salir}>Salir</button>
      </header>

      {mensaje && <p className="notice">{mensaje}</p>}

      <section className="grid">
        <div className="card kpi">
          <p>Ingreso agrícola</p>
          <h2>${totalVentas.toLocaleString('es-AR')}</h2>
        </div>
        <div className="card kpi">
          <p>Costo agrícola</p>
          <h2>${totalCostos.toLocaleString('es-AR')}</h2>
        </div>
        <div className="card kpi">
          <p>Margen</p>
          <h2>${(totalVentas - totalCostos).toLocaleString('es-AR')}</h2>
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <h2>Alta inicial</h2>
          <input value={empresaNombre} onChange={e => setEmpresaNombre(e.target.value)} />
          <button onClick={crearEmpresa}>Crear empresa</button>

          <input value={campaniaNombre} onChange={e => setCampaniaNombre(e.target.value)} />
          <button onClick={crearCampania}>Crear campaña</button>

          <input value={loteNombre} onChange={e => setLoteNombre(e.target.value)} />
          <input type="number" value={loteHa} onChange={e => setLoteHa(e.target.value)} />
          <button onClick={crearLote}>Crear lote</button>
        </div>

        <div className="card">
          <h2>Costo agrícola</h2>
          <input type="date" value={costo.fecha} onChange={e => setCosto({...costo, fecha: e.target.value})} />
          <select value={costo.cultivo} onChange={e => setCosto({...costo, cultivo: e.target.value})}>
            <option>Soja</option><option>Maíz</option><option>Trigo</option><option>Girasol</option>
          </select>
          <input placeholder="Concepto" value={costo.concepto} onChange={e => setCosto({...costo, concepto: e.target.value})} />
          <input placeholder="Cantidad por ha" type="number" value={costo.cantidad_por_ha} onChange={e => setCosto({...costo, cantidad_por_ha: e.target.value})} />
          <input placeholder="Costo unitario" type="number" value={costo.costo_unitario} onChange={e => setCosto({...costo, costo_unitario: e.target.value})} />
          <input placeholder="Hectáreas" type="number" value={costo.hectareas} onChange={e => setCosto({...costo, hectareas: e.target.value})} />
          <button onClick={guardarCosto}>Guardar costo</button>
        </div>
      </section>

      <section className="card">
        <h2>Venta agrícola</h2>
        <input type="date" value={venta.fecha} onChange={e => setVenta({...venta, fecha: e.target.value})} />
        <select value={venta.cultivo} onChange={e => setVenta({...venta, cultivo: e.target.value})}>
          <option>Soja</option><option>Maíz</option><option>Trigo</option><option>Girasol</option>
        </select>
        <input placeholder="Toneladas" type="number" value={venta.toneladas} onChange={e => setVenta({...venta, toneladas: e.target.value})} />
        <input placeholder="Precio $/tn" type="number" value={venta.precio_tn} onChange={e => setVenta({...venta, precio_tn: e.target.value})} />
        <input placeholder="Comprador" value={venta.comprador} onChange={e => setVenta({...venta, comprador: e.target.value})} />
        <button onClick={guardarVenta}>Guardar venta</button>
      </section>

      <section className="card">
        <h2>Costos guardados</h2>
        <table>
          <thead><tr><th>Fecha</th><th>Cultivo</th><th>Concepto</th><th>Total</th></tr></thead>
          <tbody>{costos.map(r => <tr key={r.id}><td>{r.fecha}</td><td>{r.cultivo}</td><td>{r.concepto}</td><td>${Number(r.costo_total || 0).toLocaleString('es-AR')}</td></tr>)}</tbody>
        </table>
      </section>

      <section className="card">
        <h2>Ventas guardadas</h2>
        <table>
          <thead><tr><th>Fecha</th><th>Cultivo</th><th>Tn</th><th>Total</th></tr></thead>
          <tbody>{ventas.map(r => <tr key={r.id}><td>{r.fecha}</td><td>{r.cultivo}</td><td>{r.toneladas}</td><td>${Number(r.ingreso_total || 0).toLocaleString('es-AR')}</td></tr>)}</tbody>
        </table>
      </section>
    </main>
  );
}
