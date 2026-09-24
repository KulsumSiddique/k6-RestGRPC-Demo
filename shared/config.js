const environment = __ENV.TEST_ENV || 'local';

const defaults = {
  local: {
    restBaseUrl: 'http://localhost:8080',
    grpcAddress: 'localhost:5051',
    grpcTls: false,
  },
  public: {
    restBaseUrl: 'https://quickpizza.grafana.com',
    grpcAddress: 'grpc-quickpizza.grafana.com:443',
    grpcTls: true,
  },
};

const selected = defaults[environment] || defaults.public;

export const config = {
  environment,
  restBaseUrl: __ENV.REST_BASE_URL || selected.restBaseUrl,
  grpcAddress: __ENV.GRPC_ADDR || selected.grpcAddress,
  grpcTls: __ENV.GRPC_TLS ? __ENV.GRPC_TLS !== 'false' : selected.grpcTls,
};
