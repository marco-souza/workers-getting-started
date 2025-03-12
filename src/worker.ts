import { Ai } from "@cloudflare/ai";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
	const query = c.req.query();

	const askAi = query.ai === "true";
	console.log({ query, askAi });

	if (!askAi) {
		console.log("no ai");
		return c.json({ hello: "World" });
	}

	console.log("[ai]");
	const ai = new Ai(c.env.AI);

	const messages = [
		{
			role: "system",
			content:
				"Hello,You are a friendly assistent to generate greetings for our users",
		},
		{ role: "user", content: "Hello, I am a user" },
	];

	const inputs = { messages };
	const res = await ai.run("@cf/meta/llama-3-8b-instruct", inputs);

	return c.json(res);
});

app.get("/movies", async (c) => {
	const resp = await c.env.DB
		// select all movies
		.prepare("SELECT * from 'movies'")
		.all();
	const movies = resp.results;

	return c.json(movies);
});

app.get("/favorites", async (c) => {
	const { num = "1" } = c.req.query();
	const resp = await c.env.DB
		// select all movies and order by rating
		.prepare("SELECT * from 'movies' order by rating desc limit ?1")
		// bind values to query variables
		.bind(num)
		.all();
	const movies = resp.results;

	return c.json(movies);
});

const UpdateMovieRating = z.object({
	rating: z
		.number()
		// between 1 and 5
		.min(1)
		.max(5),
});

app.put(
	"/movies/:id",
	// add zod validator middleware
	zValidator("json", UpdateMovieRating),
	async (c) => {
		const { id } = c.req.param();
		const body = c.req.valid("json");

		console.log({ id, body });

		const resp = await c.env.DB
			// update movie rating
			.prepare("UPDATE movies SET rating = ?1 WHERE id = ?2 RETURNING *")
			// bind values to query variables
			.bind(body.rating, id)
			.run();

		if (!resp.success) {
			console.log(resp.error);
			return c.json({ error: resp.error, message: "Failed to update rating" });
		}

		console.log(resp);

		return c.json(resp.results);
	},
);

app.get("/:username", async (c) => {
	const username = c.req.param("username");
	const cachedResp = await c.env.CACHE.get(`${username}:repos`);

	if (cachedResp) {
		const { repos, count } = JSON.parse(cachedResp);
		console.log("cached");
		return c.json({ repos, count });
	}

	const res = await fetch(`https://api.github.com/users/${username}/repos`, {
		headers: {
			"User-Agent": "CF-Worker",
		},
	});
	const repos = await res.json();
	const { length: count } = repos as unknown[];
	const output = { repos, count };

	await c.env.CACHE.put(`${username}:repos`, JSON.stringify(output), {
		expirationTtl: 60 * 60,
	});

	return c.json(output);
});

export default app satisfies ExportedHandler<Env>;
