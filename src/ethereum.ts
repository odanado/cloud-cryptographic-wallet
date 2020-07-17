import { Client } from "jayson/promise";

export class Ethereum {
  private client: Client;
  constructor(endpoint: string) {
    const url = new URL(endpoint);

    this.client = this.getClient(url);
  }

  private getClient(url: URL): Client {
    if (url.protocol === "https:") {
      return Client.https({
        hostname: url.hostname,
        path: url.pathname,
        port: url.port,
      });
    }
    if (url.protocol === "http:") {
      return Client.http({
        hostname: url.hostname,
        path: url.pathname,
        port: url.port,
      });
    }
    throw new Error(`unknown protocol ${url.protocol}`);
  }

  public async netVersion(): Promise<string> {
    const response = await this.client.request("net_version", []);
    return response.result;
  }
}
