import { Client } from "jayson/promise";

export class Ethereum {
  private client: Client;
  constructor(endpoint: string) {
    const url = new URL(endpoint);
    console.log(url);

    this.client = Client.https({ host: url.host, path: url.pathname });
  }

  public async netVersion(): Promise<string> {
    const response = await this.client.request("net_version", []);
    return response.result;
  }
}
