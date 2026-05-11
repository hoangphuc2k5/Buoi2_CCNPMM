import crypto from 'crypto';

let generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
}

export { generateOtp };