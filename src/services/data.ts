import {
  Service,
  Api,
  HashedPayload,
  INSResponse,
  INSBaseResponse
} from "./base";

interface BundleRequest {
  data_network: string;
}

interface DataBundle {
  [key: string]: any;
  code: string;
  title: string;
  price: string;
  network: string;
  allowance?: string;
  available: string;
}

interface BundleResponse extends INSBaseResponse {
  bundles: DataBundle[] | DataBundle | null;
}

interface SmileInfoRequest extends HashedPayload {
    receiver: string;
}

/**
 *
 *
 * @interface VendRequest
 * @extends {HashedPayload}
 */
interface VendRequest extends HashedPayload {
  vtu_network: string;
  vtu_data: number;
  vtu_number: number;
  vtu_email: string;
}

interface VendResponse extends INSResponse {
  receiver: number;
  amount: number;
  amount_paid: number;
}

/**
 *
 *
 * @export
 * @class Data
 * @extends {Service}
 */
export class Data extends Service {
  protected Resource = Api.DATA;

  public getBundles(data: BundleRequest) {
    return this.sendRequest<BundleResponse>(
      "GET",
      this.Resource.GET_BUNDLES,
      data
    );
  }

  public getSmileInfo(data: SmileInfoRequest) {
    if (!data.vendor_code && this._settings.vendor_code) {
        data.vendor_code = this._settings.vendor_code;
      }
      data.hash = this.hash(
        data.vendor_code,
        data.receiver
      );
      return this.sendRequest<any>("GET", this.Resource.GET_SMILE_INFO, data);
  }

  /**
   *
   *
   * @param {VendRequest} data
   * @returns
   * @memberof Data
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
      data.vtu_data
    );
    return this.sendRequest<VendResponse>("GET", this.Resource.VEND, data);
  }
}
