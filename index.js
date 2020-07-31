const express = require('express');
const database = require('./database');
const server = express();
server.use(express.json());

server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

let nextId = null;

server.get('/', (req, res) => {
    return res.json({
        result: 'Back-stocks'
    });
});

async function getNetxId(req, res, next) {
    await database.query(`SELECT MAX(id) FROM stocks;`,
        { type: database.QueryTypes.SELECT })
        .then(id => {
            nextId = id[0].max;
            nextId++;
        });
    next();
}

server.post('/stocks', getNetxId, async (req, res) => {
    let addstock;

    const { name, mark, quantity, perishable } = req.body;

    await database.query(`INSERT INTO stocks VALUES(${nextId},'${name}','${mark}','${quantity}','${perishable}');`,
        { type: database.QueryTypes.INSERT })
        .then(result => {
            addstock = result;
        })
        .catch(err => {
            return res.json(err);
        });
    if (addstock[1]) {
        return res.json({
            result: 'Produto inserido com sucesso!'
        });
    } else {
        return res.json({
            result: 'Não foi possivel inserir o produto!'
        });
    }

})


server.get('/stocks', async (req, res) => {
    let stocks;

    await database.query(`SELECT * FROM stocks`, { type: database.QueryTypes.SELECT })
        .then(results => {
            stocks = results;
        }).catch(err => {
            return res.json(err);
        })

    return res.json({ stocks });
});

server.get('/stocks/:id', async (req, res) => {
    const { id } = req.params;
    let stock;

    await database.query(`SELECT * FROM stocks WHERE id = ${id} `, { type: database.QueryTypes.SELECT })
        .then(results => {
            stock = results;
        }).catch(err => {
            return res.json(err);
        })
    if (stock[0]) {
        return res.json({
            result: 'produto encontrado com sucesso!',
            stock: stock
        });
    } else {
        return res.json({
            result: 'Não foi possivel encontrar o produto!'
        });
    }


})

server.put('/stocks/:id', async (req, res) => {
    const { name, mark, quantity, perishable } = req.body;
    const { id } = req.params;

    let update;

    await database.query(`UPDATE stocks SET name = '${name}', mark = '${mark}', quantity = '${quantity}', perishable = '${perishable}' WHERE id = ${id}`,
        { type: database.QueryTypes.UPDATE })
        .then(results => {
            update = results;
        }).catch(err => {
            return res.json(err);
        })
    if (update[1]) {
        return res.json({
            result: 'Produto atualizado com sucesso!'
        });
    } else {
        return res.json({
            result: 'Não foi possivel atualizar o produto!'
        });
    }

})

server.delete('/stocks/:id', async (req, res) => {
    const { id } = req.params;
    let deletar;

    await database.query(`DELETE FROM stocks WHERE id = ${id}`,
        { type: database.QueryTypes.DELETE })
        .then(results => {
            deletar = results;
        }).catch(err => {
            return res.json(err);
        })
    if (deletar) {
        return res.json({
            result: 'Produto deletado com sucesso'
        });
    } else {
        return res.json({
            result: 'Não foi possivel deletar o produto!'
        });
    }


})


server.listen(process.env.PORT);