import connection from "../dbStrategy/postgres.js";
import { nanoid } from "nanoid";

export async function urlShorten(req, res) {
  const { url } = req.body;
  const shortUrl = nanoid();
  const token = req.headers.authorization.replace("Bearer ", "");

  if (!url || url.length === 0) {
    return res.status(422).send("url vazia ou inválida");
  }

  const { rows: auxArr } = await connection.query(
    `SELECT u.* FROM users u JOIN tokens t ON t."userId" = u.id WHERE t.token = $1`,
    [token]
  );
  const user = auxArr[0];

  await connection.query(
    `INSERT INTO urls (url,"shortUrl","userId") VALUES ($1,$2,$3)`,
    [url, shortUrl, user.id]
  );
  await connection.query(
    `
  UPDATE users SET "linksCount" = $1 WHERE id = $2`,
    [user.linksCount + 1, user.id]
  );

  res.status(201).send({
    shortUrl,
  });
}

export async function getUrls(req, res) {
  const { id } = req.params;

  const { rows: body } = await connection.query(
    `SELECT id, "shortUrl", url FROM urls WHERE id = $1`,
    [id]
  );

  if (body.length === 0) {
    res.sendStatus(404);
  } else {
    res.status(200).send(body);
  }
}

export async function redirectToUrl(req, res) {
  const { shortUrl } = req.params;

  try {
    const { rows } = await connection.query(
      `SELECT * FROM urls WHERE "shortUrl" = $1 `,
      [shortUrl]
    );
    const urlObj = rows[0];

    if (!urlObj) {
      return res.sendStatus(404);
    }

    await connection.query(`UPDATE urls SET "visitCount" = $1 WHERE id = $2`, [
      urlObj.visitCount + 1,
      urlObj.id,
    ]);

    return res.redirect(urlObj.url);
  } catch (error) {
    res.status(500).send(error);
  }
}

export async function deleteUrl(req, res) {
  const { authorization } = req.headers;
  const { id: urlId } = req.params;
  const token = authorization.replace("Bearer ", "");

  const { rows: aux } = await connection.query(
    `SELECT * FROM urls WHERE id = $1`,
    [urlId]
  );
  const urlObj = aux[0];
  const { rows: aux1 } = await connection.query(
    `SELECT t."userId", u."linksCount" FROM tokens t JOIN users u ON t."userId" = u.id WHERE token = $1`,
    [token]
  );
  const tokenObj = aux1[0];

  if (!urlObj) {
    res.sendStatus(404);
  } else if (tokenObj.userId === urlObj.userId) {
    await connection.query(`DELETE FROM urls WHERE id = $1`, [urlId]);
    await connection.query(`UPDATE users SET "linksCount" = $1 WHERE id = $2`,[tokenObj.linksCount - 1, tokenObj.userId])
    res.sendStatus(204);
  } else {
    res.sendStatus(401);
  }
}
