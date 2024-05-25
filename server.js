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

let status = "";
let message = "";

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

// app.post('/registro', async (req, res) => {
//     const { email, nombre, password, passwordConfirm, anos_experiencia, especialidad, foto } = req.params;

//     const fotoPath = `${__dirname}/public/${nombre}.jpg`;

//     try {
//         if (email && nombre && password && passwordConfirm && anos_experiencia && especialidad && foto) {
//             if (password === passwordConfirm) {
//                 if (!req.files || !req.files.target_file) {
//                     return res.status(400).send("Por favor, ingresa una imagen para subir");
//                 }

//                 const { target_file } = req.files;

//                 target_file.mv(fotoPath, (err) => {
//                     if (err) res.status(500).send(err)
//                     foto = fotoPath;
//                 })

//                 const query = await querys.registrar(email, nombre, password, anos_experiencia, especialidad, foto);

//                 res.status(201).json({
//                     message: 'Skater registrado correctamente.',
//                     skater: query.rows
//                 })

//             } else {
//                 console.log("La contraseña ingresada deben ser la misma.");
//                 return res.status(400).json({ error: 'La contraseña ingresada deben ser la misma.' });
//             }

//         } else {
//             console.log("Por favor, proporciona todos los datos para continuar.");
//             return res.status(400).json({ error: 'Por favor, proporciona todos los datos para continuar.' });
//         }
//     } catch (err) {
//         console.log("Error General: ", err)
//         const final = errors(err.code, status, message);
//         console.log("Codigo de Error: ", final.code);
//         console.log("Status de Error: ", final.status);
//         console.log("Mensaje de Error: ", final.message);
//         console.log("Error Original: ", err.message);
//         res.status(final.status).json(final.message);
//     }
// })

// app.get('/login', (req, res) => {
//     const { email, password } = req.params;

//     const skater = querys.login(email, password);

//     const skaterID = querys.consultaSkater(email);

//     try {

//         if (skater.find((s) => s.email === email && s.password === password)) {
//             const token = jwt.sign({
//                 exp: Math.floor(Date.now() / 1000) + 120,
//                 data: skater,
//                 id: skaterID
//             }, secretKey);

//             res.redirect(`/restricted?token=${token}`);
//         } else {
//             res.status(401).send("Usuario o contraseña incorrecta");
//         }

//     } catch (err) {
//         console.log("Error General: ", err)
//         const final = errors(err.code, status, message);
//         console.log("Codigo de Error: ", final.code);
//         console.log("Status de Error: ", final.status);
//         console.log("Mensaje de Error: ", final.message);
//         console.log("Error Original: ", err.message);
//         res.status(final.status).json(final.message);
//     }
// })

// const verifyToken = (req, res, next) => {
//     const token = req.query.token || req.headers['x-access-token'];

//     if (!token) {
//         return res.status(401).send("Acceso no autorizado, token es requerido");
//     }

//     jwt.verify(token, secretKey, (err, user) => {
//         if (err) {
//             return res.status(403).send("Token inválido o expirado");
//         }
//         req.user = user;
//         next();
//     });
// };

// app.get('/restricted', verifyToken, (req, res) => {

// })

// app.put('/editar', async (req, res) => {
//     const { email, nombre, password, passwordConfirm, anos_experiencia, especialidad } = req.params;

//     try {
//         if (email && nombre && password && passwordConfirm && anos_experiencia && especialidad) {
//             if (password === passwordConfirm) {

//                 await querys.editar(email, nombre, password, anos_experiencia, especialidad);

//                 const skaterActualizado = await querys.consultaSkater(email);

//                 if (skaterActualizado.length > 0) {
//                     res.json({
//                         message: 'Skater actualizado correctamente',
//                         skater: skaterActualizado[0]
//                     });
//                 }

//             } else {
//                 console.log("La contraseña ingresada deben ser la misma.");
//                 return res.status(400).json({ error: 'La contraseña ingresada deben ser la misma.' });
//             }
//         } else {
//             console.log("Por favor, proporciona todos los datos para continuar.");
//             return res.status(400).json({ error: 'Por favor, proporciona todos los datos para continuar.' });
//         }
//     } catch (err) {
//         console.log("Error General: ", err)
//         const final = errors(err.code, status, message);
//         console.log("Codigo de Error: ", final.code);
//         console.log("Status de Error: ", final.status);
//         console.log("Mensaje de Error: ", final.message);
//         console.log("Error Original: ", err.message);
//         res.status(final.status).json(final.message);
//     }
// })

// app.delete('/eliminar', async (req, res) => {
//     const { email } = req.params;
//     try {
//         const query = await querys.eliminar(email);

//         res.json({
//             message: 'Usuario eliminado correctamente'
//         });

//     } catch (err) {
//         console.log("Error General: ", err)
//         const final = errors(err.code, status, message);
//         console.log("Codigo de Error: ", final.code);
//         console.log("Status de Error: ", final.status);
//         console.log("Mensaje de Error: ", final.message);
//         console.log("Error Original: ", err.message);
//         res.status(final.status).json(final.message);
//     }
// })

// app.put('/aprobar', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const query = await querys.aprobar(id);

//         res.json({
//             message: 'Skater aprobado correctamente'
//         });

//     } catch (err) {
//         console.log("Error General: ", err)
//         const final = errors(err.code, status, message);
//         console.log("Codigo de Error: ", final.code);
//         console.log("Status de Error: ", final.status);
//         console.log("Mensaje de Error: ", final.message);
//         console.log("Error Original: ", err.message);
//         res.status(final.status).json(final.message);
//     }
// })

app.use((req, res) => {
    res.send('Esta página no existe...');
});

