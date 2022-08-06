import connection from "../dbStrategy/postgres.js";

export async function getUserUrls(req, res) {
  const { authorization } = req.headers;
  const token = authorization.replace("Bearer ", "");

  const { rows: aux } = await connection.query(
    `SELECT u.id, u.name  FROM users u JOIN tokens t ON u.id = t."userId" WHERE token = $1`,
    [token]
  );
  const { id, name } = aux[0];

  const { rows: shortenedUrls } = await connection.query(
    `SELECT id, url, "shortUrl", "visitCount" FROM urls WHERE "userId" = $1 `,
    [id]
  );

  let visitCount = 0;

  if (shortenedUrls.length !== 0) {
    shortenedUrls.map((url) => {
      visitCount += url.visitCount;
    });
  }

  res.status(200).send({
    id,
    name,
    visitCount,
    shortenedUrls,
  });
}
