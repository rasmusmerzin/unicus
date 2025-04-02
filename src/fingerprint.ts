export const fingerprint = () =>
  navigator.credentials.create({
    publicKey: {
      challenge: new Uint8Array(32),
      rp: { name: "Example, Inc." },
      user: { id: new Uint8Array(32), name: "user", displayName: "User" },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      authenticatorSelection: { authenticatorAttachment: "platform" },
      timeout: 60000,
      attestation: "none",
    },
  });
