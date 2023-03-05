import original_crypto from "node:crypto"
const crypto = {
    ...original_crypto,
    randomBytes(n: number) {
        return Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff])
    }
}
export default crypto;