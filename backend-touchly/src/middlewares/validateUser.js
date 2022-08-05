import connection from "../dbStrategy/postgres.js";

export default async function validateUser(req, res, next) {
  const { authorization } = req.headers;

  const token = authorization?.replace("Bearer ", "");
  const { rows: session } = await connection.query(
    `SELECT * FROM tokens WHERE token = $1`,
    [token]
  );

  if (session.length === 0) {
    return res.sendStatus(401);
  }
  next();
}
