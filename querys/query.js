const pool = require('../config/configDB');

async function visualizar(){
    const queryJson = {
        text: 'SELECT * FROM skaters'
    };

    const { rows } = await pool.query(queryJson);

    return rows;
}

async function login(email, password){
    const queryJson = {
        text: `SELECT * FROM skaters WHERE email = $1 AND password = $2`,
        values: [email, password]
    }

    const { rows } = await pool.query(queryJson);

    return rows[0];
}

async function consultaSkater(id) {
    const queryJson = {
        text: `SELECT * FROM skaters WHERE id = $1`,
        values: [id]
    }

    const { rows } = await pool.query(queryJson);

    return rows;
}

async function registrar(email, nombre, password, anos_experiencia, especialidad, foto) {
    const queryJson = {
        text: `INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) VALUES ($1, $2, $3, $4, $5, $6, FALSE) RETURNING *`,
        values: [email, nombre, password, anos_experiencia, especialidad, foto]
    };

    const results = await pool.query(queryJson);

    return results;
}

async function editar(id, nombre, anos_experiencia, especialidad) {
    const queryJson = {
        text: `UPDATE skaters SET nombre = $2, anos_experiencia = $3, especialidad = $4 WHERE id = $1 RETURNING *`,
        values: [id, nombre, anos_experiencia, especialidad]
    };

    const { rows } = await pool.query(queryJson);

    return rows;
}

async function eliminar(id) {
    const queryJson = {
        text: `DELETE FROM skaters WHERE id = $1 RETURNING *`,
        values: [id]
    };

    const { rows } = await pool.query(queryJson);

    return rows;
}

async function aprobar(id) {
    const queryJson = {
        text: `UPDATE skaters SET estado = TRUE WHERE id = $1 RETURNING *`,
        values: [id]
    }

    const { rows } = await pool.query(queryJson);

    return rows;
}

module.exports = {
    visualizar,
    login,
    consultaSkater,
    registrar,
    editar,
    eliminar,
    aprobar
}