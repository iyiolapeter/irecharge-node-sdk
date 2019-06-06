import {
  Service,
  Api,
  HashedPayload,
  INSResponse,
  INSBaseResponse
} from "./base";

/**
 *
 *
 * @interface VendRequest
 * @extends {HashedPayload}
 */
interface VendRequest extends HashedPayload {
  smartcard_number: number;
  service_code: number;
  startimes_amount?: number;
  tv_network: string;
  phone: string;
  email: string;
  access_token: number;
}

/**
 *
 *
 * @interface SmartCardRequest
 * @extends {HashedPayload}
 */
interface SmartCardRequest extends HashedPayload {
  smartcard_number: number;
  service_code: number;
  tv_amount?: number;
  tv_network: string;
}

interface SmartCardResponse extends INSBaseResponse {
  access_token: number;
  customer: string;
  customer_number: string;
}

interface BouquetRequest {
  tv_network: string;
}

interface TVBundle {
  [key: string]: any;
  code: string;
  title: string;
  price: string;
  network?: string;
  available?: string;
  allowance?: string;
}

interface BouquetResponse extends INSBaseResponse {
  bundles: TVBundle[] | TVBundle | null;
}

/**
 *
 *
 * @export
 * @class Tv
 * @extends {Service}
 */
export class Tv extends Service {
  protected Resource = Api.TV;
  /**
   *
   *
   * @returns
   * @memberof Tv
   */
  public getBouquets(data: BouquetRequest) {
    return this.sendRequest<BouquetResponse>(
      "GET",
      this.Resource.GET_BOUQUETS,
      data
    );
  }

  /**
   *
   *
   * @param {SmartCardRequest} data
   * @returns
   * @memberof Tv
   */
  public getSmartCardInfo(data: SmartCardRequest) {
    if (!data.vendor_code && this._settings.vendor_code) {
      data.vendor_code = this._settings.vendor_code;
    }
    data.hash = this.hash(
      data.vendor_code,
      data.reference_id,
      data.tv_network,
      data.smartcard_number,
      data.service_code
    );
    return this.sendRequest<SmartCardResponse>(
      "GET",
      this.Resource.GET_SMARTCARD_INFO,
      data
    );
  }

  /**
   *
   *
   * @param {VendRequest} data
   * @returns
   * @memberof Tv
   */
  public vend(data: VendRequest) {
    if (!data.vendor_code && this._settings.vendor_code) {
      data.vendor_code = this._settings.vendor_code;
    }
    data.hash = this.hash(data.vendor_code, data.reference_id, data.smartcard_number, data.tv_network, data.service_code, data.access_token);
    return this.sendRequest<INSResponse>("GET", this.Resource.VEND, data);
  }
}
