import express from 'express';
import path from 'path';

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

app.use(express.static('../client/dist/'));

app.get('/', (req: any, res: any) => {
    res.sendFile(path.join(__dirname, '../client/dist/basic.html'));
});

app.listen(PORT, HOST);
