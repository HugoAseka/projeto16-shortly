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
  const { rows: auxArr } = await connection.query(
    `SELECT * FROM urls WHERE "shortUrl" = $1 `,
    [shortUrl]
  );
  const urlObj = auxArr[0];
  const x = urlObj.views + 1;
  console.log(urlObj.views);
  await connection.query(`UPDATE urls SET views = $1 WHERE id = $2`, [
    x,
    urlObj.id,
  ]);

  res.redirect(urlObj.url);
}
