"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var deporteSchema = new mongoose_1.default.Schema({
    nombre: { type: String },
    descripcion: { type: String },
    atletas: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Atleta' }]
});
var Deporte = mongoose_1.default.model('Asignatura', deporteSchema);
exports.default = Deporte;
