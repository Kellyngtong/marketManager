import { Express, Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const publicImagesDir = path.resolve(__dirname, '../../public/images');

if (!fs.existsSync(publicImagesDir)) {
  fs.mkdirSync(publicImagesDir, { recursive: true });
}

const generateFilename = (originalName: string): string => {
  const now = new Date();
  const iso = now.toISOString().replace(/[:.]/g, '-');
  const unique = `${iso}-${Date.now()}`;
  return unique + path.extname(originalName);
};

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, publicImagesDir);
  },
  filename: (_req: any, file: any, cb: any) => {
    cb(null, generateFilename(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: (req: any, file: any, cb: any) => {
    if (/^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)) {
      cb(null, true);
      return;
    }

    (req as any).fileValidationError = 'Tipo de archivo no permitido';
    cb(null, false);
  },
});

export default (app: Express): void => {
  const router = Router();

  router.post('/', (req, res) => {
    upload.single('image')(req, res, (err: any) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large' });
        }
        return res.status(400).json({ error: err.message || 'Upload error' });
      }

      if ((req as any).fileValidationError) {
        return res.status(400).json({ error: (req as any).fileValidationError });
      }

      if (!(req as any).file) {
        return res.status(400).json({ error: 'No se subió ninguna imagen' });
      }

      const file = (req as any).file;
      const imageUrl = `${req.protocol}://${req.get('host')}/public/images/${file.filename}`;
      return res.json({ imageUrl });
    });
  });

  app.use('/api/upload', router);
};
