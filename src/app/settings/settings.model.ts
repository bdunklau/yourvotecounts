export class Settings {
  address_choices_adjustment?: string  // https://headsupvideo.atlassian.net/browse/HEADSUP-46
  admin_sms: string
  cloud_host: string
  cloud_host_test_path: string
  console_logging: boolean
  disabled: boolean;
  firebase_functions_host: string
  from_sms: string;
  heapThreshold: number
  max_call_time: number  // seconds
  to_sms: string;
  website_domain_name: string
  promo_codes: string[]
  projectId: string
  storage_keyfile: string
}
