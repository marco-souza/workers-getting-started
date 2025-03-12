import { Ai } from "@cloudflare/ai";
import { Hono } from "hono";

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
	const sql = "SELECT * from 'movies'";
	const resp = await c.env.DB.prepare(sql).all();
	const movies = resp.results;

	return c.json(movies);
});

app.get("/favorites", async (c) => {
	const { num = "1" } = c.req.query();
	const sql = "SELECT * from 'movies' order by rating desc limit ?1";
	const resp = await c.env.DB.prepare(sql)
		.bind(num) // bind values to query variables
		.all();
	const movies = resp.results;

	return c.json(movies);
});

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
