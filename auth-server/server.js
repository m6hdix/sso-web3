const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const ethUtil = require("ethereumjs-util");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const JWT_SECRET = "your_jwt_secret_key";

app.post("/authenticate", (req, res) => {
  const { address, signature, message } = req.body;

  try {
    if (!address || !signature || !message) {
      return res.status(400).send("Missing parameters");
    }

    // Ensure message is a valid string
    const msgBuffer = Buffer.from(message, "utf8"); // Convert message to UTF-8 buffer
    const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
    const signatureBuffer = Buffer.from(signature.slice(2), "hex"); // Convert signature to buffer
    const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
    const publicKey = ethUtil.ecrecover(
      msgHash,
      signatureParams.v,
      signatureParams.r,
      signatureParams.s
    );
    const addressBuffer = ethUtil.pubToAddress(publicKey);
    const recoveredAddress = ethUtil.bufferToHex(addressBuffer);

    if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
      const token = jwt.sign({ address }, JWT_SECRET, { expiresIn: "1h" });
      res.json({ token });
    } else {
      res.status(401).send("Invalid signature");
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/verify-token", (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ address: decoded.address });
  } catch (error) {
    console.error("Error during token verification:", error);
    res.status(401).send("Invalid token");
  }
});

app.listen(3001, () => {
  console.log("Authentication server listening on port 3001");
});
