import connection from "../dbStrategy/postgres.js";

export async function getRankings(req, res) {
  const {rows:rankings} = await connection.query(`
    SELECT u.name AS "name",u.id AS "id" , u."linksCount" AS "linkCount", SUM(urls."visitCount") AS "visitCount" FROM urls 
    JOIN users u ON u.id = urls."userId"
    GROUP BY u.id
    ORDER BY "visitCount" DESC
    ;`);

    res.status(200).send(rankings);

}
