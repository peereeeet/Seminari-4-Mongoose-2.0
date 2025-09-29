import mongoose from 'mongoose';

const deporteSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, trim: true },
  atletas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Atleta' }]
}, { versionKey: false });

// 👇 IMPORTANTE: el modelo se debe llamar 'Deporte' para que ref: 'Deporte' funcione
const Deporte = mongoose.model('Deporte', deporteSchema);
export default Deporte;
