export interface TTNHTTPPayload {
  app_id: string;
  dev_id: string;
  port: number;
  counter: number;
  payload_raw: string;
  downlink_url: string;
  payload_fields: { value: number };
  metadata: {
    time: string;
    latitude: number;
    longitude: number;
    altitude: number;
  };
}
