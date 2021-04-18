import { RequestManager, Client, HTTPTransport } from "@open-rpc/client-js";

export class Ethereum {
  private client: Client;
  constructor(endpoint: string) {
    this.client = this.getClient(endpoint);
  }

  private getClient(url: string): Client {
    const transport = new HTTPTransport(url);
    const requestManager = new RequestManager([transport]);
    const client = new Client(requestManager);

    return client;
  }

  public async netVersion(): Promise<string> {
    const response = await this.client.request({
      method: "net_version",
      params: [],
    });
    return response.result;
  }
}
