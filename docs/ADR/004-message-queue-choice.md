# ADR-004: Message Queue/Event Bus Choice for SaaS Scaling (RabbitMQ vs. Kafka)

## Context

As PEDAL evolves toward a scalable, cloud-hosted SaaS platform, a robust message queue or event bus will be required to:
- Decouple pipeline stages and microservices
- Buffer and distribute jobs and events at high throughput
- Enable horizontal scaling of workers and services
- Support reliability, durability, and observability in a distributed system

The choice of message queue/event bus will have significant impact on system architecture, operational complexity, and future extensibility. This ADR documents the tradeoffs between two leading open-source options: RabbitMQ and Apache Kafka.

## Options Considered

### 1. RabbitMQ
- **Type:** Traditional message broker (AMQP)
- **Model:** Queues, exchanges, routing keys; supports pub/sub, work queues, RPC
- **Delivery:** At-most-once, at-least-once, (with plugins: exactly-once)
- **Persistence:** Durable queues, message acknowledgments, disk-backed storage
- **Topology:** Centralized broker, supports clustering and federation
- **Ecosystem:** Mature, broad client support (many languages)

### 2. Apache Kafka
- **Type:** Distributed event streaming platform (log-based)
- **Model:** Topics, partitions, consumer groups; optimized for pub/sub and event sourcing
- **Delivery:** At-least-once (default), exactly-once (with configuration)
- **Persistence:** Log-structured, highly durable, long-term retention
- **Topology:** Distributed, horizontally scalable, partitioned
- **Ecosystem:** Rich ecosystem (Kafka Connect, Streams, Schema Registry, etc.)

## Pros and Cons

### RabbitMQ
**Pros:**
- Simple, low-latency message delivery (good for job queues, RPC, short-lived tasks)
- Flexible routing (direct, topic, fanout, headers exchanges)
- Easy to set up and operate for small/medium workloads
- Mature management UI and monitoring tools
- Lightweight footprint; can run in a single node or small cluster
- Good for transactional, per-message acknowledgment workflows
- Broad language and framework support

**Cons:**
- Not optimized for very high throughput or large message backlogs
- Scaling horizontally (across many nodes) is complex; clustering has limitations
- Message retention is limited (messages are deleted after consumption)
- Not ideal for event sourcing, replay, or analytics use cases
- Operational complexity increases with high-availability and federation

### Apache Kafka
**Pros:**
- Designed for high-throughput, distributed, and durable event streaming
- Scales horizontally to handle massive workloads (millions of messages/sec)
- Persistent log allows for message replay, event sourcing, and analytics
- Strong ordering and partitioning guarantees
- Ecosystem supports stream processing, connectors, schema management
- Good for both real-time and batch/event-driven architectures

**Cons:**
- Operationally heavier: requires Zookeeper (or KRaft), more moving parts
- Higher learning curve for setup, tuning, and monitoring
- Not as simple for classic job queue or RPC patterns (workarounds needed)
- Message delivery latency can be higher for small, transactional workloads
- Requires careful planning for partitioning, retention, and consumer group management

## Summary Table

| Feature/Concern         | RabbitMQ                        | Apache Kafka                    |
|------------------------|----------------------------------|---------------------------------|
| Model                  | Queues, exchanges (AMQP)         | Topics, partitions (log-based)  |
| Throughput             | Moderate                         | Very high                       |
| Latency                | Low                              | Moderate                        |
| Durability             | Good (disk-backed)                | Excellent (log, replication)    |
| Message Retention      | Short-term (until consumed)      | Long-term (configurable)        |
| Replay/Event Sourcing  | Limited                          | Native                          |
| Scaling                | Clustered, but limited           | Horizontally, highly scalable   |
| Ecosystem              | Broad, mature                    | Rich, especially for streaming  |
| Ops Complexity         | Low/Medium                       | High                            |
| Best For               | Job queues, RPC, transactional   | Event streaming, analytics      |

## Notes
- This ADR does not make a final recommendation; it is intended to document the tradeoffs for future decision-making as PEDAL SaaS scales.
- Both RabbitMQ and Kafka are open-source, cloud-agnostic, and can be self-hosted or run as managed services on all major clouds. 