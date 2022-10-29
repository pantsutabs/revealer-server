This is a simple server that reveals NFTs as they mint

## install

```bash
npm install
```

copy config.json.example to config.json, and update the RPC and contract address, if you want to reveal manually or delay the reveal, set autoRevealEnabled to false to disable automatic querying of supply

move all of your images into private/, if your images aren't .png you will need to update the code, replace any instance of .png with .whatever in index.js

move all of your jsons into private/json/, everything is expected to be named number.file

## usage notes

this works as intended if your NFTs are minted incrementally without gaps in their token IDs

less important but the code also assumes your first token id is 1, and not 0, if it is 0 it will never reveal the last NFT, will require some minor adjustment

## run

```bash
node index.js
```

it is meant to run as a service and not manually

## Image location update tool

This is handy but not necessary, the revealer will update the image link to the current url and the current structure

```bash
node updateImageLocInJsons.js "somewebsite.xyz/nft/<ID>.png"
```

\<ID\> will be replaced with the number in the json's filename, it's just a dumb replacement so something like \<ID-1\> is not going to work

## Unrevealed server (deprecated)

Returns generic metadata and points to the same image for any request. The normal server already serves this purpose though, with a lastTokenId of -1

```bash
node indexUnrevealed.js
```

## how to reveal (deprecated)

NOTE: The endpoint is disabled, this is done automatically

```bash
curl -d "{\"lastTokenId\":333}" -H "Content-Type: application/json" -H "Authorization: password" -X POST http://localhost:3000/api/post/updateLastTokenId
```

Replace 333 with your last token id, password with your password, and put your url instead of localhost, or alternatively, change to config and restart the server
