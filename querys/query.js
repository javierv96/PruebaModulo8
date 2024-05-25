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

async function consultaSkater(email) {
    const queryJson = {
        text: `SELECT id FROM skaters WHERE email = $1`,
        values: [email]
    }

    const { rows } = await pool(queryJson);

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

async function editar(email, nombre, password, anos_experiencia, especialidad) {
    const queryJson = {
        text: `UPDATE skaters SET nombre = $1, password = $2, anos_experiencia = $3, especialidad = $4 WHERE email = $5 RETURNING *`,
        values: [nombre, password, anos_experiencia, especialidad, email]
    };

    const { rows } = await pool.query(queryJson);

    return rows;
}

async function eliminar(email) {
    const queryJson = {
        text: `DELETE FROM skaters WHERE email = $1 RETURNING *`,
        values: [email]
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