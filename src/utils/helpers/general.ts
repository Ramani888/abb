import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const env = process.env;

export const encryptPassword = (password: string) => {
    return new Promise((resolve) => {
      bcrypt.genSalt(5, function (err, salt: any) {
      bcrypt.hash(password, salt, function (err, hash) {
          return resolve(hash);
      });
      });
    });
};

export const comparePassword = (storedPassword: string, validatePassword: string): Promise<boolean> => {
    if (storedPassword === validatePassword) {
        return Promise.resolve(true);
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(storedPassword, validatePassword, (err: Error | null, res?: boolean) => {
        if (err) return reject(err);
        return res === true ? resolve(res) : reject(new Error('Passwords do not match.'));
      });
    });
};

export function authenticateToken(req: any, res: any, next: any) {
  const token = req.header('Authorization');
  const SECRET_KEY: any = env.SECRET_KEY;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    console.log('err', err);
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    req.user = user;
    next();
  });
}

export function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const timePart = now.getTime(); // Milliseconds since epoch
  return `INV-${datePart}-${timePart}`;
}