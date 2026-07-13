# Start here

## 1. Put the project on your Desktop

Unzip the downloaded archive and move `erli-rest-client-ts` to your Desktop.

```bash
cd ~/Desktop/erli-rest-client-ts
npm install
npm run check
```

Expected result:

```text
3 test files passed
13 tests passed
ESM + CJS + declarations built in dist/
```

## 2. Create an empty GitHub repository

Create a public repository named:

```text
erli-rest-client-ts
```

Do not initialize it with a README, license or .gitignore because they are already included.

## 3. Push the project

```bash
cd ~/Desktop/erli-rest-client-ts

git init
git branch -M main
git add .
git commit -m "feat: initialize ERLI REST client"
git remote add origin https://github.com/CichockiAdrian/erli-rest-client-ts.git
git push -u origin main
```

## 4. Install it in another project

```bash
npm install github:CichockiAdrian/erli-rest-client-ts
```

## 5. Use it

```ts
import { ErliClient } from "erli-rest-client-ts";

const erli = new ErliClient({
  apiKey: process.env.ERLI_API_KEY!,
  userAgent: "MyApp/1.0.0 (+https://example.com)"
});

const inbox = await erli.inbox.list();
console.log(inbox);
```
