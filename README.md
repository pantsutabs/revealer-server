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

## Image location update tool

This is handy but not necessary, the revealer will update the image link to the current url and the current structure

```bash
node updateImageLocInJsons.js "somewebsite.xyz/nft/<ID>.png"
```

<ID> will be replaced with the number in the json's filename, it's just a dumb replacement so something like \<ID-1\> is not going to work

## Unrevealed server (deprecated)

returns generic metadata and points to the same image for any request
the normal server already serves this purpose though, with a lastTokenId of -1

```bash
node indexUnrevealed.js
```