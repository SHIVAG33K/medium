import { Hono } from 'hono';
const app = new Hono();
app.post('/api/v1/user/signup', (c) => {
});
app.post('/api/v1/user/signin', (c) => {
});
app.post('/api/v1/blog', (c) => {
});
app.put('/api/v1/blog', (c) => {
});
app.get('/api/v1/blog/:id', (c) => {
});
app.get('/api/v1/blog/bulk', (c) => {
});
export default app;
