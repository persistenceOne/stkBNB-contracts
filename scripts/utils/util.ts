// sleeps for the given number of seconds
export async function sleep(seconds: number) {
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
}
