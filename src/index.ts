import mongoose from 'mongoose';
import Deporte from './modules/deporte';
import Atleta from './modules/atleta';

mongoose.connect('mongodb://127.0.0.1:27017/ejercicio1')
  .then(() => {
    console.log('Conectado a MongoDB');
    main();
  })
  .catch(err => console.error('No se pudo conectar a MongoDB', err));

// ------- CREATE -------
async function crearDeporte(nombre: string, descripcion: string) {
  const deporte = new Deporte({ nombre, descripcion });
  const r = await deporte.save();
  console.log('Deporte creado:', r);
}

async function crearAtleta(nombre: string, edad: number, altura: string) {
  const atleta = new Atleta({ nombre, edad, altura });
  const r = await atleta.save();
  console.log('Atleta creado:', r);
}

// ------- READ/List -------
async function listarAtletas() {
  const atletas = await Atleta.find().populate('deportesPracticados', 'nombre');
  console.log('Atletas:', atletas);
}

async function listarDeportes() {
  const deportes = await Deporte.find().populate('atletas', 'nombre');
  console.log('Deportes:', deportes);
}

async function verAtleta(nombre: string) {
  const atleta = await Atleta.findOne({ nombre }).populate('deportesPracticados', 'nombre');
  console.log('Atleta:', atleta);
}

async function verDeporte(nombre: string) {
  const deporte = await Deporte.findOne({ nombre }).populate('atletas', 'nombre');
  console.log('Deporte:', deporte);
}

// ------- UPDATE (EDITAR) -------
async function editarAtleta(nombre: string, cambios: Partial<{ edad: number; altura: string; nombre: string }>) {
  const r = await Atleta.findOneAndUpdate({ nombre }, cambios, { new: true, runValidators: true });
  console.log('Atleta editado:', r);
}

async function editarDeporte(nombre: string, cambios: Partial<{ descripcion: string; nombre: string }>) {
  const r = await Deporte.findOneAndUpdate({ nombre }, cambios, { new: true, runValidators: true });
  console.log('Deporte editado:', r);
}

// ------- DELETE (BORRAR) -------
async function borrarAtleta(nombre: string) {
  const r = await Atleta.findOneAndDelete({ nombre });
  console.log('Atleta borrado:', r);
}

async function borrarDeporte(nombre: string) {
  const r = await Deporte.findOneAndDelete({ nombre });
  console.log('Deporte borrado:', r);
}

// ------- LINKING (RELACIONES) -------
async function asignarDeportesAtleta(nombreAtleta: string, nombresDeportes: string[]) {
  const atleta = await Atleta.findOne({ nombre: nombreAtleta });
  if (!atleta) { console.error('No existe el atleta'); return; }

  const deportes = await Deporte.find({ nombre: { $in: nombresDeportes } });
  if (deportes.length === 0) { console.error('No existen esos deportes'); return; }

  for (const dep of deportes) {
    // evita duplicados
    if (!atleta.deportesPracticados.some(id => id.toString() === dep._id.toString())) {
      atleta.deportesPracticados.push(dep._id);
    }
  }
  await atleta.save();
  console.log(`Deportes asignados a ${nombreAtleta}:`, atleta.deportesPracticados);
}

async function asignarAtletasDeporte(nombreDeporte: string, nombresAtletas: string[]) {
  const deporte = await Deporte.findOne({ nombre: nombreDeporte });
  if (!deporte) { console.error('No existe el deporte'); return; }

  const atletas = await Atleta.find({ nombre: { $in: nombresAtletas } });
  if (atletas.length === 0) { console.error('No existen esos atletas'); return; }

  for (const atl of atletas) {
    if (!deporte.atletas.some(id => id.toString() === atl._id.toString())) {
      deporte.atletas.push(atl._id);
    }
  }
  await deporte.save();
  console.log(`Atletas asignados a ${nombreDeporte}:`, deporte.atletas);
}

// ------- AGGREGATION -------
async function obtenerNumeroDeAtletasPorDeporte() {
  const r = await Deporte.aggregate([
    { $project: { nombre: 1, numAtletas: { $size: { $ifNull: ['$atletas', []] } } } },
    { $sort: { numAtletas: -1, nombre: 1 } }
  ]);
  console.log('Número de atletas por deporte:', r);
}

// ------- DEMO -------
async function main() {
  console.log('Creamos atletas y deportes');
  await crearAtleta('Pere', 21, '1.75');
  await crearAtleta('Carles', 23, '1.77');
  await crearAtleta('Andrea', 23, '1.65');

  await crearDeporte('Baloncesto', 'Tirar balón a canasta y encestar');
  await crearDeporte('Fútbol', 'Chutar balón a portería para marcar gol');
  await crearDeporte('Golf', 'Meter la bola en el hoyo');
  await crearDeporte('Tenis', 'Pelota pequeña con raqueta');

  console.log('Asignar deportes a los atletas');
  await asignarDeportesAtleta('Pere',   ['Baloncesto', 'Fútbol']);
  await asignarDeportesAtleta('Carles', ['Tenis', 'Fútbol', 'Golf']);
  await asignarDeportesAtleta('Andrea', ['Baloncesto', 'Tenis']);

  console.log('Asignar atletas a los deportes');
  await asignarAtletasDeporte('Baloncesto', ['Pere', 'Andrea']);
  await asignarAtletasDeporte('Fútbol', ['Pere', 'Carles']);
  await asignarAtletasDeporte('Tenis', ['Andrea', 'Carles']);
  await asignarAtletasDeporte('Golf', ['Carles']);

  console.log('Aggregation Pipeline');
  await obtenerNumeroDeAtletasPorDeporte();

  console.log('Listar y ver');
  await listarAtletas();
  await listarDeportes();
  await verAtleta('Pere');
  await verDeporte('Baloncesto');

  console.log('Editar (UPDATE) y Borrar (DELETE)');
  await editarAtleta('Pere', { altura: '1.76' });
  await editarDeporte('Golf', { descripcion: 'Palo y hoyo 😉' });
  await borrarAtleta('Andrea');
  await borrarDeporte('Tenis');

  await listarAtletas();
  await listarDeportes();

  await mongoose.connection.close();
}
