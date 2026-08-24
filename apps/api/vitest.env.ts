/**
 * Environment for the API test suite. DB_DATABASE is always coerced to a
 * `*_test` name; a dev database is never a valid target.
 *
 * Local server:
 *   podman run -d --name dharma-test-pg -p 5433:5432 \
 *     -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=dharma_test \
 *     docker.io/library/postgres:17
 *
 * 5433, not 5432: the docker-compose dev database listens on 5432.
 */
export function applyTestEnv(): void {
  process.env.NODE_ENV ||= "test";
  process.env.DB_HOST ||= "localhost";
  process.env.DB_PORT ||= "5433";
  process.env.DB_USER ||= "postgres";
  process.env.DB_PASSWORD ||= "postgres";

  const base = (process.env.DB_DATABASE || "dharma").replace(/_test$/, "");
  process.env.DB_DATABASE = `${base}_test`;

  process.env.JWT_SECRET ||= "test-jwt-secret";
  process.env.COOKIE_SECRET ||= "test-cookie-secret";

  // KafkaService connects at boot when this is set.
  delete process.env.KAFKA_BROKERS;
}
