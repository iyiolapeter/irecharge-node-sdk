import request from "request-promise";
import crypto from "crypto";
//import errors from "request-promise/errors";
import { RequestAPI, RequiredUriUrl } from "request";
import { IncomingHttpHeaders } from "http";

export const STAGING_URL = "https://irecharge.com.ng/pwr_api_sandbox/";
export const PROD_URL = "https://irecharge.com.ng/pwr_api_live/";

// const assert = (schema:Object)=>{
//     return function(target: any,key: PropertyKey,descriptor: PropertyDescriptor){

//     }
// };

export const Api = {
  POWER: {
    GET_ELECTRICITY_DISCO: "/v2/get_electric_disco.php",
    GET_METER_INFO: "/v2/get_meter_info.php",
    VEND: "/v2/vend_power.php"
  },
  AIRTIME: {
    VEND: "/v2/vend_airtime.php"
  },
  DATA: {
    GET_BUNDLES: "/v2/get_data_bundles.php",
    VEND: "/v2/vend_data.php"
  },
  TV: {
    GET_BOUQUETS: "/v2/get_tv_bouquet.php",
    GET_SMARTCARD_INFO: "/v2/get_tv_bouquet.php",
    VEND: "/v2/vend_smartcard.php"
  },
  STATUS: {
    VEND: "/v1/vend_status.php",
    BALANCE: "/v1/check_balance.php"
  }
};

/**
 *
 *
 * @export
 * @interface APICredentials
 */
export interface APICredentials {
  publicKey: string;
  privateKey: string;
  live: boolean;
  vendor_code?: string;
  responseFormat: "json" | "xml";
  proxy?: string;
}

export interface StringObject {
  [key: string]: any;
}

export interface HashedPayload extends StringObject {
  vendor_code?: string;
  reference_id: number;
  hash?: string;
}

export interface INSBaseResponse {
  status: string;
  message: string;
}

export interface INSResponse extends INSBaseResponse {
  ref: string;
  order: string;
  wallet_balance: number;
  response_hash?: string;
}

/**
 *
 *
 * @export
 * @interface APIResponse
 * @template T
 */
export interface APIResponse<T extends INSResponse | StringObject> {
  headers: IncomingHttpHeaders;
  statusCode: number;
  body: T;
}

export abstract class Service {
  private _baseRequest: RequestAPI<
    request.RequestPromise,
    request.RequestPromiseOptions,
    RequiredUriUrl
  >;
  protected abstract Resource: Object;
  protected _settings: APICredentials;

  constructor(
    settings: APICredentials,
    baseRequest: RequestAPI<
      request.RequestPromise,
      request.RequestPromiseOptions,
      RequiredUriUrl
    >
  ) {
    this._settings = Object.freeze(settings);
    this._baseRequest = baseRequest;
  }

  sendRequest<T>(
    method: string,
    path: string,
    payload: Object,
    headers?: Object
  ): Promise<APIResponse<T>> {
    return new Promise((resolve, reject) => {
      let options: request.RequestPromiseOptions & request.OptionsWithUri = {
        method: method,
        uri: path,
        qs: {
          ...payload,
          ...{ response_format: this._settings.responseFormat }
        }
      };
      if (headers) {
        options.headers = headers;
      }
      this._baseRequest(options)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  protected hash(...args: Array<any>) {
    args.push(this._settings.publicKey);
    let combinedstring = args.join(`|`);
    console.log("combined string: ", combinedstring);
    return crypto
      .createHmac("sha1", this._settings.privateKey)
      .update(combinedstring)
      .digest("hex");
  }

  abstract vend(data: HashedPayload): any;
}
