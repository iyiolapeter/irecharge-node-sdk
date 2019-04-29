import { Service, Api } from "./base";

export class Status extends Service {
  protected Resource = Api.STATUS;

  public balance() {
    return this.sendRequest("GET", this.Resource.BALANCE, {});
  }

  public vend() {
    return this.sendRequest("GET", this.Resource.VEND, {});
  }
}
