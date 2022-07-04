export class NormalizeResponse {
  constructor(
    private body: { success: boolean; data?: any; msg?: string; code: number }
  ) {}
  toString() {
    return JSON.stringify(this.body);
  }
  toObject() {
    return this.body;
  }

  static success(data: any, msg?: string) {
    return new NormalizeResponse({
      success: true,
      data,
      msg,
      code: 200
    }).toString();
  }

  static error(data: any, msg?: string) {
    return new NormalizeResponse({
      success: false,
      data,
      msg,
      code: 400
    }).toString();
  }
}
