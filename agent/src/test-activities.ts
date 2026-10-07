import { verifyRemediation } from './activities';
import axios from 'axios';

// Manually mock axios
const originalAxiosGet = axios.get;

async function testActivities() {
    console.log("Running Activity Tests...");
    
    axios.get = async () => ({
        data: {
            data: { result: [{ value: [123, "NaN"] }] }
        }
    }) as any;

    // Run verifyRemediation with mocked axios
    const resultNaN = await verifyRemediation('http://service', 'rate(checkout_errors)');
    if (resultNaN.status !== 'inconclusive') {
        throw new Error(`NaN test failed. Expected inconclusive, got ${resultNaN.status}`);
    }
    console.log("✅ NaN validation passed.");
    
    axios.get = async () => ({
        data: {
            data: { result: [{ value: [123, "-5.0"] }] }
        }
    }) as any;
    
    const resultNeg = await verifyRemediation('http://service', 'rate(checkout_errors)');
    if (resultNeg.status !== 'inconclusive') {
        throw new Error(`Negative value test failed. Expected inconclusive, got ${resultNeg.status}`);
    }
    console.log("✅ Negative value validation passed.");
    
    axios.get = async () => ({
        data: {
            data: { result: [{ value: [123, "Infinity"] }] }
        }
    }) as any;
    const resultInf = await verifyRemediation('http://service', 'rate(checkout_errors)');
    if (resultInf.status !== 'inconclusive') {
        throw new Error(`Infinity value test failed. Expected inconclusive, got ${resultInf.status}`);
    }
    console.log("✅ Infinity value validation passed.");

    axios.get = async () => ({
        data: {
            data: { result: [] } // Malformed / empty result
        }
    }) as any;
    const resultMalformed = await verifyRemediation('http://service', 'rate(checkout_errors)');
    if (resultMalformed.status !== 'inconclusive') {
        throw new Error(`Malformed value test failed. Expected inconclusive, got ${resultMalformed.status}`);
    }
    console.log("✅ Malformed value validation passed.");

    axios.get = originalAxiosGet;
}

testActivities().catch(err => {
    console.error("Activity test failed:", err);
    process.exit(1);
});
