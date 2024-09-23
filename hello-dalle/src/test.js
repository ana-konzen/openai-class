const myURL = "https://oaidalleapiprodscus.blob.core.windows.net/private/org-fghq5CYuuZ82xvi6YVu6y9Za/user-DfesCRZxrFCnsa5FkCed4VAc/img-UGPocP9jBIMX6l4jLedhxQzh.png?st=2024-09-17T14%3A24%3A44Z&se=2024-09-17T16%3A24%3A44Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-09-16T23%3A12%3A28Z&ske=2024-09-17T23%3A12%3A28Z&sks=b&skv=2024-08-04&sig=UlgxsRwn3oek9p95b5cIc/MZhqkXbBMERxBvZBPvF70%3D"

const response = await fetch(myURL);

const data = await response.arrayBuffer();

await Deno.writeFile('./aiimage.png', new Uint8Array(data));
