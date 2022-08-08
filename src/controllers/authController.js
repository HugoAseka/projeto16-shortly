import connection from "../dbStrategy/postgres.js";
import Joi from "joi";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";

export async function signUp(req, res) {
  // const { rows : users } = await connection.query(`SELECT * FROM users`);

  const newUser = req.body;
  const { rows: existingEmail } = await connection.query(
    `SELECT * FROM users WHERE email = $1`,
    [newUser.email]
  );
  const newUserSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string()
      .pattern(/[a-z0-9]+@[a-z]+.[a-z]{2,3}/)
      .required(),
    password: Joi.string().required(),
    confirmPassword: Joi.string().required(),
  });

  try {
    const { error } = newUserSchema.validate(newUser);
    if (newUser.password !== newUser.confirmPassword) {
      return res.status(422).send("senhas não correspondem!");
    }
    if (error) {
      return res.status(422).send("erro de requisição!");
    }
    if (existingEmail.length !== 0) {
      return res.status(409).send("email já cadastrado!");
    }

    const encryptedPassword = bcrypt.hashSync(newUser.password, 10);

    await connection.query(
      `INSERT INTO users (name,email,password) VALUES ($1,$2,$3)`,
      [newUser.name, newUser.email, encryptedPassword]
    );

    res.sendStatus(201);
  } catch {
    res.sendStatus(500);
  }
}

export async function signIn(req, res) {
  const userReq = req.body;
  const userReqSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  const { error } = userReqSchema.validate(userReq);
  if (error && userReq.email.length === 0) {
    return res.status(422).send("Email não pode estar vazio");
  } else if (error && userReq.password.length === 0) {
    return res.status(422).send("Senha não pode estar vazia");
  }

  const { rows: userdb } = await connection.query(
    `SELECT * FROM users WHERE email = $1`,
    [userReq.email]
  );

  try {
    if (
      userdb.length !== 0 &&
      bcrypt.compareSync(userReq.password, userdb[0].password)
    ) {
      const token = uuid();

      await connection.query(
        `INSERT INTO tokens ("userId",token) VALUES ($1,$2)`,
        [userdb[0].id, token]
      );

      res.status(200).send({ token });
    } else {
      return res.status(401).send("Senha ou Email incorretos");
    }
  } catch {
    return res.sendStatus(500);
  }
}
