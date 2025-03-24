import express, { Request, Response } from "express";

const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from TypeScript!");
});

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});