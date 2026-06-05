import * as Crypto from 'expo-crypto';


export const generateRandomId = () => {
    return Crypto.randomUUID();
}