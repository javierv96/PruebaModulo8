const express = require('express');
const app = express();
const exphbs = require("express-handlebars");
const expressFileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');
const secretKey = 'P4$$w0rD';
const PORT = process.env.SV_PORT || 3000;

const querys = require('./querys/query.js');

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(__dirname + "/public"));

app.use(
    expressFileUpload({
        limits: 5000000,
        abortOnLimit: true,
        responseOnLimit: "El tamaño de la imagen supera el limite permitido",
    })
);

app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main",
        layoutsDir: `${__dirname}/views/mainLayout`,
    })
);
app.set("view engine", "handlebars");

const getSkaters = async () => {
    try {
        return await querys.visualizar();
    } catch (e) {
        console.error(`Error al obtener los skaters: ${e}`);
        return [];
    }
};

app.get("/", async (req, res) => {
    try {
        const skaters = await getSkaters();
        console.log("Skaters: ", skaters);
        res.render("Home", { skaters });
    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        });
    }
});

app.get("/registro", (req, res) => {
    res.render("Registro");
});

app.get("/login", (req, res) => {
    res.render("Login");
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const skater = await querys.login(email, password);
        console.log(skater);

        const token = jwt.sign(skater, secretKey);
        res.status(200).send(token);
    } catch (e) {
        console.log(e);
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        })
    };
});

app.get("/perfil", (req, res) => {
    const { token } = req.query;
    jwt.verify(token, secretKey, (err, skater) => {
        if (err) {
            res.status(500).send({
                error: `Algo salio mal...`,
                message: err.message,
                code: 500
            })
        } else {
            res.render("Perfil", { skater });
        }
    })
});

app.get("/Admin", async (req, res) => {
    try {
        const skaters = await getSkaters();
        res.render("Admin", { skaters });
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    };
});

//API REST de Skaters

app.get("/skaters", async (req, res) => {
    const skaters = await getSkaters();
    try {
        res.status(200).send(skaters);
    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        })
    }
});

app.post("/skaters", async (req, res) => {
    const { email, nombre, password, anos_experiencia, especialidad} = req.body;
    const { files } = req;
    let { foto } = files;
    const { name } = foto;
    const pathPhoto = `/uploads/${nombre}.jpg`;

    foto.mv(`${__dirname}/public${pathPhoto}`, async (err) => {
        try {
                if (err) throw err;
                foto = pathPhoto
                const query = await querys.registrar(email, nombre, password, anos_experiencia, especialidad, foto);
                res.status(201).redirect("/");
        } catch (e) {
            res.status(500).send({
                error:`Algo salio mal... ${e}`,
                code: 500
            })
        }
    })
})

app.put("/skaters", async (req, res) => {
    const {id, nombre, anos_experiencia, especialidad} = req.body;
    try {
        const skaterB = await querys.consultaSkater(id);
        console.log("SKATER", skaterB);
        if (skaterB) {
            const query = await querys.editar(id, nombre, anos_experiencia, especialidad);
            res.status(200).send("Datos actualizados con exito");
        } else {
            res.status(400).send("No existe este Skater");
        }

    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code:500
        })
    };
});

app.put("/skaters/status/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const skaterB = await querys.consultaSkater(id);
        if (skaterB) {
            const query = await querys.aprobar(id);
            res.status(200).send("Estado Actualizado con exito");
        } else {
            res.status(400).send("No existe este Skater");
        }
    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        })
    };
});

app.delete("/skaters/:id", async (req, res) => {
    const { id } = req.params
    try {
        const skaterB = await querys.consultaSkater(id);
        if (skaterB) {
            const query = await querys.eliminar(id);
            res.status(200).send("Skater Eliminado con éxito");
        } else {
            res.status(400).send("No existe este Skater");
        }
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    };
});

app.use((req, res) => {
    res.send('Esta página no existe...');
});

