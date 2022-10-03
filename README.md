This is a simple server that reveals NFTs as they mint
currently you have to tell it the latest token id via POST

## install

```bash
npm install
```

copy config.json.example to config.json, and change the password

move all of your images into private/

move all of your jsons into private/json/, everything is expected to be named number.file, and formats do, and remember to update the metadata image url accordingly

## run

```bash
node index.js
```

it is meant to run as a service and not manually

## how to reveal

```bash
curl -d "{\"lastTokenId\":333}" -H "Content-Type: application/json" -H "Authorization: password" -X POST http://localhost:3000/api/post/updateLastTokenId
```

replace 333 with your last token id, password with your password, and put your url instead of localhost