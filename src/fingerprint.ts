export const fingerprint = (): Promise<string | null> =>
  navigator.credentials
    .create({
      publicKey: {
        challenge: new Uint8Array(32),
        rp: { name: "Merzin" },
        user: { id: new Uint8Array(32), name: "user", displayName: "User" },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        authenticatorSelection: { authenticatorAttachment: "platform" },
      },
    })
    .then(
      (credential) =>
        JSON.parse(JSON.stringify(credential))?.response?.authenticatorData ||
        null
    );
