# InvisibleChat-API


Source code of the InvisibleChat API (currently hosted on repl.it, kept online with UptimeRobot)

## API

### `https://invisiblechatapi.hubertmoszkarel.repl.co` POST

Decryption request

```json
{
  "type": "reveal",
  "password": "YOURPASSWORD", //The Password they used to encrypt
  "secret": "EncryptedMessage", // Someones Encrypted Message
}
```
Decryption response

```json
{
  "response": "DecryptedMessage",
  "url": "First Url in the message if there is one"
}
```


Encryption request
```json
{
  "type": "hide",
  "password": "YOURPASSWORD", // Password the other person has to use to decrypt
  "secret": "EncryptedMessage", // The Message you want to Encrypt
  "cover": "Cover Message" // The Message other people will see
}
```

Encryption response
```json
{
  "response": "encryptedMessage" // Message containing your encrypted message
}
```

Error Response
```json
{
  "response": "ERRORMESSAGE"
}
```

### `invisiblechatapi.hubertmoszkarel.repl.co/stats` GET

```json
{
  "api_calls": 0, // Calls Made so far
  "encryption_calls": 0, // Calls for encryption so far
  "decryption_calls": 0, // Calls for decryption so far
  "urls_found": 0, // Times image urls have been found so far
  "api_errors": 0 // Amount Errored Calls so far
}
```

### `https://invisiblechatapi.hubertmoszkarel.repl.co/keepalive` GET 
(Only used to keep the server alive with UptimeRobot)

```
Alive
```
