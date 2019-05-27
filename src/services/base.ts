import request from "request-promise";
import crypto from "crypto";
//import errors from "request-promise/errors";
import { RequestAPI, RequiredUriUrl, Response } from "request";
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
    GET_SMARTCARD_INFO: "/v2/get_smartcard_info.php",
    VEND: "/v2/vend_smartcard.php"
  },
  STATUS: {
    VEND: "/v1/vend_status.php",
    BALANCE: "/v1/check_balance.php"
  }
};

type Logger = (...args: any) => any;

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
  trace?: Logger | boolean;
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

function transformer(format: string) {
  return (body: any, response: Response) => {
    try {
      if (format === "json") {
        body = JSON.parse(String(body).replace("\ufeff", ""));
      }
      return {
        statusCode: response.statusCode,
        headers: response.headers,
        body
      };
    } catch (error) {
      return {
        statusCode: 422,
        headers: response.headers,
        body: {
          message: "Invalid Response Received (This is from SDK)",
          originalBody: body,
          originalStatusCode: response.statusCode,
          error: error
        }
      };
    }
  };
}

export abstract class Service {
  private _baseRequest: RequestAPI<
    request.RequestPromise,
    request.RequestPromiseOptions,
    RequiredUriUrl
  >;

  private trace: boolean;
  // tslint:disable-next-line: no-console
  private logger: Logger = console.log;

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
    if (settings.trace === true) {
      this.trace = true;
    } else if (typeof settings.trace === "function") {
      this.trace = true;
      this.logger = settings.trace;
    } else {
      this.trace = false;
    }
    this._settings = Object.freeze(settings);
    this._baseRequest = baseRequest.defaults({
      transform: transformer(this._settings.responseFormat)
    });
  }

  sendRequest<T>(
    method: string,
    path: string,
    payload: Object,
    headers?: Object
  ): Promise<APIResponse<T>> {
    this.log("IRechage ===> Method: ", method);
    this.log("IRechage ===> Path: ", path);
    this.log("IRechage ===> Response Format: ", this._settings.responseFormat);
    this.log("IRechage ===> Payload: ", payload);
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
          this.log("IRechage ===> Response: ", response);
          resolve(response);
        })
        .catch(error => {
          this.log("IRechage ===> Error: ", error);
          reject(error);
        });
    });
  }

  private log(...args: any) {
    if (this.trace) {
      this.logger(...args);
    }
  }

  protected hash(...args: Array<any>) {
    args.push(this._settings.publicKey);
    let combinedstring = args.join(`|`);
    this.log("IRechage ===> Combined String: ", combinedstring);
    let hash = crypto
      .createHmac("sha1", this._settings.privateKey)
      .update(combinedstring)
      .digest("hex");
    this.log("IRechage ===> Hash: ", hash);
    return hash;
  }

  abstract vend(data: HashedPayload): any;
}
