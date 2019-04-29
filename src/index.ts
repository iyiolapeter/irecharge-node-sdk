import request from "request-promise";
import { STAGING_URL, PROD_URL, APICredentials } from "./services/base";

import { Airtime } from "./services/airtime";
import { Power } from "./services/power";
import { Data } from "./services/data";
import { Tv } from "./services/tv";
import { Status } from "./services/status";

/**
 *
 *
 * @export
 * @class iRecharge
 */
export class iRecharge {
  public Airtime: Airtime;
  public Power: Power;
  public Data: Data;
  public Tv: Tv;
  public Status: Status;

  /**
   *Creates an instance of iRecharge.
   * @param {APICredentials} settings
   * @memberof iRecharge
   */
  constructor(settings: APICredentials) {
    let baseUrl = settings.live ? PROD_URL : STAGING_URL;
    let options: request.RequestPromiseOptions = {
      baseUrl: baseUrl,
      transform: (body, response) => {
        return {
          statusCode: response.statusCode,
          body:
            settings.responseFormat == "json"
              ? JSON.parse(String(body).replace("\ufeff", ""))
              : body,
          headers: response.headers
        };
      }
    };
    if (settings.proxy) {
      options.proxy = settings.proxy;
    }
    if (settings.responseFormat == "json") {
      options.json = true;
    }
    let baseRequest = request.defaults(options);
    this.Airtime = new Airtime(settings, baseRequest);
    this.Data = new Data(settings, baseRequest);
    this.Power = new Power(settings, baseRequest);
    this.Tv = new Tv(settings, baseRequest);
    this.Status = new Status(settings, baseRequest);
  }
}
