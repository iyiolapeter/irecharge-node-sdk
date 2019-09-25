import {
  Service,
  Api,
  HashedPayload,
  INSResponse,
  INSBaseResponse
} from "./base";

interface VendRequest extends HashedPayload {
  meter: string;
  access_token: number;
  disco: string;
  amount: number;
  phone: string;
  email: string;
}

interface VendResponse extends INSResponse {
  meter_token: string;
  units: string;
  amount: string;
  address: string;
}

interface MeterInfoRequest extends HashedPayload {
  meter: string;
  disco: string;
}

interface MeterInfoResponse extends INSBaseResponse {
  access_token: number;
  customer: string;
}

interface DiscoBundle {
  [key: string]: any;
  id: string;
  code: string;
  description: string;
}

interface DiscoResponse extends INSBaseResponse {
  bundles: DiscoBundle[] | DiscoBundle | null;
}

/**
 *
 *
 * @export
 * @class Power
 * @extends {Service}
 */
export class Power extends Service {
  protected Resource = Api.POWER;

  /**
   *
   *
   * @returns
   * @memberof Power
   */
  public getDiscos() {
    return this.sendRequest<DiscoResponse>(
      "GET",
      this.Resource.GET_ELECTRICITY_DISCO,
      {}
    );
  }

  /**
   *
   *
   * @returns
   * @memberof Power
   */
  public getMeterInfo(data: MeterInfoRequest) {
    if (!data.vendor_code && this._settings.vendor_code) {
      data.vendor_code = this._settings.vendor_code;
    }
    data.hash = this.hash(
      data.vendor_code,
      data.reference_id,
      data.meter,
      data.disco
    );
    return this.sendRequest<MeterInfoResponse>(
      "GET",
      this.Resource.GET_METER_INFO,
      data
    );
  }

  /**
   *
   *
   * @returns
   * @memberof Power
   */
  public vend(data: VendRequest) {
    if (!data.vendor_code && this._settings.vendor_code) {
      data.vendor_code = this._settings.vendor_code;
    }
    data.hash = this.hash(
      data.vendor_code,
      data.reference_id,
      data.meter,
      data.disco,
      data.amount,
      data.access_token
    );
    return this.sendRequest<VendResponse>("GET", this.Resource.VEND, data);
  }
}
