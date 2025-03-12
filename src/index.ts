import { Ai } from "@cloudflare/ai";
import { Hono } from "hono";

export interface Bindings {
	AI: Ai;
	CACHE: KVNamespace;
}

const app = new Hono<{ Bindings: Bindings }>();

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

app.get("/:username", async (c) => {
	const username = c.req.param("username");

	console.log({ username });

	const res = await fetch(`https://api.github.com/users/${username}/repos`, {
		headers: {
			"User-Agent": "CF-Worker",
		},
	});
	const repos = await res.json();
	const { length: count } = repos as unknown[];

	return c.json({ repos, count });
});

export default app satisfies ExportedHandler<Bindings>;
