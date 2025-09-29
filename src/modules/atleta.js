"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var atletaSchema = new mongoose_1.default.Schema({
    nombre: { type: String },
    edad: { type: Number },
    altura: { type: String },
    deportesPracticados: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Deporte' }]
}, { versionKey: false });
var Atleta = mongoose_1.default.model('Atleta', atletaSchema);
exports.default = Atleta;
