import express from 'express';
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import {Server} from "socket.io";
import homeRouter from './routes/home.router.js'
import realTimeRouter from './routes/realtimeproducts.router.js';
import { productsRouter } from './routes/products.router.js';
import { cartRouter } from './routes/cart.router.js';
import productManager from './ProductManager.js';

const app = express();
const port = 8080;
const httpServer = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

const io = new Server(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use('/api/products', productsRouter);
app.use('/api/carts', cartRouter);
app.use('/', homeRouter);
app.use('/realtimeproducts', realTimeRouter);
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

const products = await productManager.getProducts();

io.on('connection', (socket) => {
    console.log('Cliente conectado');
    socket.emit('products', products);
    socket.on('addProduct', async (data) => {
        await productManager.addProduct(data);
    });
    socket.on('deleteProduct', async (data) => {
        const idDeleted = await productManager.deleteProduct(data);
        console.log(idDeleted);
        io.emit('idDeleted', idDeleted);
    }); 
});

export default io;