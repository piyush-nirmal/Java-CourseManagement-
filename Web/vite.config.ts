import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import mysql from 'mysql2/promise';

function mysqlApiPlugin() {
  let pool: any = null;

  const getPool = () => {
    if (!pool) {
      pool = mysql.createPool({
        host: 'localhost',
        port: 3306,
        user: process.env.COURSE_DB_USER || 'root',
        password: process.env.COURSE_DB_PASSWORD || 'root',
        database: 'college_db',
        waitForConnections: true,
        connectionLimit: 10,
      });
    }
    return pool;
  };

  return {
    name: 'mysql-api-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url.startsWith('/api/courses')) {
          return next();
        }

        try {
          const db = getPool();
          let body = '';

          if (req.method === 'POST' || req.method === 'PUT') {
            await new Promise((resolve) => {
              req.on('data', (chunk: any) => {
                body += chunk;
              });
              req.on('end', resolve);
            });
          }

          const parsedBody = body ? JSON.parse(body) : {};
          const urlParts = req.url.split('?')[0].split('/');
          const idParam = urlParts[3] ? parseInt(urlParts[3], 10) : null;

          if (req.method === 'GET') {
            const [rows]: any = await db.query(
              'SELECT course_id, course_name, duration, fees, trainer_name FROM courses ORDER BY course_id ASC'
            );
            const mapped = rows.map((r: any) => ({
              courseId: r.course_id,
              courseName: r.course_name,
              duration: r.duration,
              fees: Number(r.fees),
              trainerName: r.trainer_name,
            }));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(mapped));
            return;
          }

          if (req.method === 'POST') {
            const { courseId, courseName, duration, fees, trainerName } = parsedBody;
            await db.query(
              'INSERT INTO courses (course_id, course_name, duration, fees, trainer_name) VALUES (?, ?, ?, ?, ?)',
              [courseId, courseName, duration, fees, trainerName]
            );
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
            return;
          }

          if (req.method === 'PUT' && idParam) {
            const { courseName, duration, fees, trainerName } = parsedBody;
            await db.query(
              'UPDATE courses SET course_name = ?, duration = ?, fees = ?, trainer_name = ? WHERE course_id = ?',
              [courseName, duration, fees, trainerName, idParam]
            );
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
            return;
          }

          if (req.method === 'DELETE' && idParam) {
            await db.query('DELETE FROM courses WHERE course_id = ?', [idParam]);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
            return;
          }

          next();
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      mysqlApiPlugin(),
    ],
    server: {
      fs: {
        allow: ['..'],
      },
    },
  };
});
