import { Service, Api, HashedPayload, INSResponse } from "./base";

/**
 *
 *
 * @interface VendRequest
 * @extends {HashedPayload}
 */
interface VendRequest extends HashedPayload {
  vtu_network: string;
  vtu_amount: number;
  vtu_number: string;
  vtu_email: string;
}

/**
 *
 *
 * @interface VendResponse
 * @extends {INSResponse}
 */
interface VendResponse extends INSResponse {
  receiver: string;
  amount: number;
}

/**
 *
 *
 * @export
 * @class Airtime
 * @extends {Service}
 */
export class Airtime extends Service {
  protected Resource = Api.AIRTIME;

  /**
   *
   *
   * @param {VendRequest} data
   * @returns
   * @memberof Airtime
   */
  public vend(data: VendRequest) {
    if (!data.vendor_code && this._settings.vendor_code) {
      data.vendor_code = this._settings.vendor_code;
    }
    data.hash = this.hash(
      data.vendor_code,
      data.reference_id,
      data.vtu_number,
      data.vtu_network,
      data.vtu_amount
    );
    return this.sendRequest<VendResponse>("GET", this.Resource.VEND, data);
  }
}
